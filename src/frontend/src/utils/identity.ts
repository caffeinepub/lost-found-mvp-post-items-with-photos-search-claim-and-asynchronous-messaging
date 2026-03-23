import type { Principal } from "@dfinity/principal";

export function truncatePrincipal(
  principal: Principal | string,
  length = 8,
): string {
  const principalStr =
    typeof principal === "string" ? principal : principal.toString();
  if (principalStr.length <= length * 2) return principalStr;
  return `${principalStr.slice(0, length)}...${principalStr.slice(-length)}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function principalsEqual(
  p1: Principal | undefined,
  p2: Principal | undefined,
): boolean {
  if (!p1 || !p2) return false;
  return p1.toString() === p2.toString();
}
