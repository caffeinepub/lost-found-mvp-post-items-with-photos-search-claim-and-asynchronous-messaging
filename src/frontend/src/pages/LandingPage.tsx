import { Link } from "@tanstack/react-router";
import { CheckCircle, MessageCircle, Search, Users } from "lucide-react";
import LoginButton from "../components/auth/LoginButton";
import InstallPrompt from "../components/pwa/InstallPrompt";
import { useGetRegisteredUsersCount } from "../hooks/useQueries";

export default function LandingPage() {
  const { data: usersCount, isLoading: isUsersLoading } =
    useGetRegisteredUsersCount();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/10">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/lostfound-logo.dim_512x512.png"
              alt="Lost & Found"
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight">
              Lost & Found
            </span>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with gradient background image */}
        <section
          className="relative overflow-hidden"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-gradient-bg.dim_1600x700.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/45" />

          <div className="relative container py-20 md:py-32">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-7">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white drop-shadow-lg">
                  Reunite{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.90 0.22 145), oklch(0.85 0.20 195))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Lost Items
                  </span>{" "}
                  with Their Owners
                </h1>
                <p className="text-lg text-white/85 max-w-lg">
                  A secure platform where finders can post found items and
                  owners can search, claim, and safely arrange returns through
                  our messaging system.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row items-center">
                  <LoginButton />
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  <div
                    className="absolute -inset-3 rounded-3xl blur-xl opacity-60"
                    style={{ background: "oklch(0.72 0.22 145 / 0.5)" }}
                  />
                  <img
                    src="/assets/generated/lostfound-hero.dim_1600x900.png"
                    alt="Lost and Found Hero"
                    className="relative rounded-2xl shadow-2xl border border-white/20 max-w-full lg:max-w-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t border-b bg-background/80 py-10 md:py-14">
          <div className="container flex justify-center">
            <div
              data-ocid="stats.registered_users.card"
              className="group relative flex flex-col items-center gap-3 rounded-2xl px-10 py-8 shadow-lg ring-1 ring-primary/20 transition-shadow hover:shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.04 145 / 0.90), oklch(0.14 0.03 200 / 0.90))",
              }}
            >
              {/* Glow halo */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-30 blur-2xl"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.22 145), transparent 70%)",
                }}
              />

              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-md"
                style={{ background: "oklch(0.62 0.25 145)", color: "white" }}
              >
                <Users className="h-7 w-7" />
              </div>

              <div className="relative text-center">
                <div
                  className="text-5xl font-bold tabular-nums tracking-tight"
                  style={{ color: "oklch(0.92 0.18 145)" }}
                >
                  {isUsersLoading ? (
                    <span className="animate-pulse text-4xl text-white/40">
                      —
                    </span>
                  ) : (
                    (usersCount ?? 0).toLocaleString()
                  )}
                </div>
                <div
                  className="mt-1 text-base font-medium uppercase tracking-widest"
                  style={{ color: "oklch(0.78 0.10 145)" }}
                >
                  Users Registered
                </div>
              </div>

              <p
                className="relative max-w-xs text-center text-sm"
                style={{ color: "oklch(0.68 0.06 200)" }}
              >
                Join our growing community helping reunite lost items with their
                rightful owners.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t bg-gradient-to-b from-primary/5 to-accent/10 py-12 md:py-24">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tighter mb-12">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                  style={{ background: "oklch(0.62 0.25 145)", color: "white" }}
                >
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Report &amp; Search</h3>
                <p className="text-muted-foreground">
                  Post found items or search for your lost belongings with
                  detailed descriptions and photos.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                  style={{ background: "oklch(0.55 0.22 255)", color: "white" }}
                >
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Connect Securely</h3>
                <p className="text-muted-foreground">
                  Use our built-in messaging to verify ownership and coordinate
                  safe meetups.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                  style={{ background: "oklch(0.78 0.20 55)", color: "white" }}
                >
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Reunite &amp; Return</h3>
                <p className="text-muted-foreground">
                  Mark items as claimed or returned once they're back with their
                  rightful owners.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Built with <span className="text-red-500">❤</span> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined"
                  ? window.location.hostname
                  : "lost-found-app",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs">
            © {new Date().getFullYear()} Lost &amp; Found. All rights reserved.
          </p>
          <p className="text-xs">
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  );
}
