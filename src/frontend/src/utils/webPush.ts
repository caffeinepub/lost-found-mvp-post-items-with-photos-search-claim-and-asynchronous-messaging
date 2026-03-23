/**
 * Web Push Protocol implementation using browser Web Crypto API.
 *
 * Architecture: The VAPID private key lives in the frontend bundle (MVP tradeoff).
 * For production, move push dispatch to a trusted off-chain server that holds the key.
 *
 * VAPID public key (applicationServerKey for PushManager.subscribe):
 *   BL4FFKBV3RSfxAnqLQPgLNBz--qbWBXruEI5FNwBKGza8Ibih4dCE-PJWNwGYzodX3nEWkjLoZO4OxNxmMM9DD4
 */

export const VAPID_PUBLIC_KEY =
  "BL4FFKBV3RSfxAnqLQPgLNBz--qbWBXruEI5FNwBKGza8Ibih4dCE-PJWNwGYzodX3nEWkjLoZO4OxNxmMM9DD4";

const VAPID_PRIVATE_KEY = "8Ibih4dCE-PJWNwGYzodX3nEWkjLoZO4OxNxmMM9DD4";
const VAPID_SUBJECT = "mailto:admin@lostitfindit.app";

// ── Utility helpers ──────────────────────────────────────────────────────

function base64urlToUint8Array(base64url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + padding;
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function jsonToBase64url(obj: unknown): string {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ── VAPID JWT ────────────────────────────────────────────────────────────

async function importVapidPrivateKey(): Promise<CryptoKey> {
  const rawPriv = base64urlToUint8Array(VAPID_PRIVATE_KEY);
  const rawPub = base64urlToUint8Array(VAPID_PUBLIC_KEY);
  // Build JWK for P-256 private key
  const d = uint8ArrayToBase64url(rawPriv);
  const x = uint8ArrayToBase64url(rawPub.slice(1, 33));
  const y = uint8ArrayToBase64url(rawPub.slice(33, 65));
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d, x, y, key_ops: ["sign"] },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

async function buildVapidAuthHeader(audience: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 12 * 3600; // 12 hours
  const header = jsonToBase64url({ typ: "JWT", alg: "ES256" });
  const payload = jsonToBase64url({ aud: audience, exp, sub: VAPID_SUBJECT });
  const toSign = `${header}.${payload}`;
  const key = await importVapidPrivateKey();
  const toSignBytes = new TextEncoder().encode(toSign);
  const sigBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key,
    toSignBytes,
  );
  const sig = uint8ArrayToBase64url(new Uint8Array(sigBuffer));
  const jwt = `${toSign}.${sig}`;
  return `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
}

// ── Payload encryption (RFC 8291 / RFC 8188 with P-256 ECDH + HKDF + AES-128-GCM) ──

async function encryptPayload(
  plaintext: string,
  p256dh: string,
  auth: string,
): Promise<{
  ciphertext: Uint8Array<ArrayBuffer>;
  salt: Uint8Array<ArrayBuffer>;
  serverPublicKey: Uint8Array<ArrayBuffer>;
}> {
  const authSecret = base64urlToUint8Array(auth);
  const recipientPublicKeyBytes = base64urlToUint8Array(p256dh);

  // Import recipient's public key
  const recipientPublicKey = await crypto.subtle.importKey(
    "raw",
    recipientPublicKeyBytes.buffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );

  // Generate ephemeral ECDH key pair
  const ephemeralKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );

  // ECDH shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: recipientPublicKey },
    ephemeralKeyPair.privateKey,
    256,
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // Export ephemeral public key
  const serverPublicKeyBuffer = await crypto.subtle.exportKey(
    "raw",
    ephemeralKeyPair.publicKey,
  );
  const serverPublicKey = new Uint8Array(
    serverPublicKeyBuffer,
  ) as Uint8Array<ArrayBuffer>;

  // Salt
  const saltBuf = new ArrayBuffer(16);
  const salt = new Uint8Array(saltBuf) as Uint8Array<ArrayBuffer>;
  crypto.getRandomValues(salt);

  // HKDF-SHA256: pseudorandom key
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret.buffer as ArrayBuffer,
    "HKDF",
    false,
    ["deriveBits"],
  );

  // PRK from auth secret
  const authInfo = buildInfo(
    "Content-Encoding: auth\0",
    new Uint8Array(new ArrayBuffer(0)),
    new Uint8Array(new ArrayBuffer(0)),
  );
  const prk = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: authSecret.buffer,
      info: authInfo.buffer,
    },
    hkdfKey,
    256,
  );

  // Derive content encryption key and nonce
  const prkKey = await crypto.subtle.importKey("raw", prk, "HKDF", false, [
    "deriveBits",
  ]);

  const keyInfo = buildInfo(
    "Content-Encoding: aesgcm\0",
    recipientPublicKeyBytes,
    serverPublicKey,
  );
  const nonceInfo = buildInfo(
    "Content-Encoding: nonce\0",
    recipientPublicKeyBytes,
    serverPublicKey,
  );

  const cekBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: salt.buffer, info: keyInfo.buffer },
    prkKey,
    128,
  );
  const nonceBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt.buffer,
      info: nonceInfo.buffer,
    },
    prkKey,
    96,
  );

  const cek = await crypto.subtle.importKey("raw", cekBits, "AES-GCM", false, [
    "encrypt",
  ]);

  const plainBytes = new TextEncoder().encode(plaintext);
  const paddedPayload = addPadding(plainBytes);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonceBits, tagLength: 128 },
    cek,
    paddedPayload.buffer,
  );

  return {
    ciphertext: new Uint8Array(encryptedBuffer) as Uint8Array<ArrayBuffer>,
    salt,
    serverPublicKey,
  };
}

function buildInfo(
  type: string,
  recipientKey: Uint8Array,
  senderKey: Uint8Array,
): Uint8Array<ArrayBuffer> {
  const typeBytes = new TextEncoder().encode(type);
  const buf = new ArrayBuffer(
    typeBytes.length + 1 + 2 + recipientKey.length + 2 + senderKey.length,
  );
  const result = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
  let offset = 0;
  result.set(typeBytes, offset);
  offset += typeBytes.length;
  result[offset++] = 0;
  const view = new DataView(buf);
  view.setUint16(offset, recipientKey.length, false);
  offset += 2;
  result.set(recipientKey, offset);
  offset += recipientKey.length;
  view.setUint16(offset, senderKey.length, false);
  offset += 2;
  result.set(senderKey, offset);
  return result;
}

function addPadding(payload: Uint8Array): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(2 + payload.length);
  const padded = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
  new DataView(buf).setUint16(0, 0, false);
  padded.set(payload, 2);
  return padded;
}

// ── Public: send a push notification ────────────────────────────────────

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: PushPayload,
): Promise<void> {
  try {
    const { endpoint, p256dh, auth } = subscription;
    const origin = new URL(endpoint).origin;
    const vapidAuth = await buildVapidAuthHeader(origin);
    const { ciphertext, salt, serverPublicKey } = await encryptPayload(
      JSON.stringify(payload),
      p256dh,
      auth,
    );

    // Build Crypto-Key and Encryption headers
    const dh = uint8ArrayToBase64url(serverPublicKey);
    const saltB64 = uint8ArrayToBase64url(salt);

    await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: vapidAuth,
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aesgcm",
        "Crypto-Key": `dh=${dh}`,
        Encryption: `salt=${saltB64}`,
        TTL: "86400",
      },
      body: ciphertext.buffer,
    });
  } catch {
    // Push delivery is best-effort; never throw to the caller
  }
}

// ── Subscribe helper ──────────────────────────────────────────────────────

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;
    return reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64urlToUint8Array(VAPID_PUBLIC_KEY).buffer,
    });
  } catch {
    return null;
  }
}

export function serializeSubscription(
  sub: PushSubscription,
): PushSubscriptionData {
  const json = sub.toJSON();
  return {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh ?? "",
    auth: json.keys?.auth ?? "",
  };
}
