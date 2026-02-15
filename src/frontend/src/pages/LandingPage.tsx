import LoginButton from '../components/auth/LoginButton';
import { Search, MessageCircle, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/lostfound-logo.dim_512x512.png"
              alt="Lost & Found"
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight">Lost & Found</span>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Reunite Lost Items with Their Owners
              </h1>
              <p className="text-lg text-muted-foreground">
                A secure platform where finders can post found items and owners can search, claim, and
                safely arrange returns through our messaging system.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <LoginButton />
              </div>
            </div>

            <div className="relative">
              <img
                src="/assets/generated/lostfound-hero.dim_1600x900.png"
                alt="Lost and Found Hero"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-12 md:py-24">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tighter mb-12">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Report & Search</h3>
                <p className="text-muted-foreground">
                  Post found items or search for your lost belongings with detailed descriptions and photos.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Connect Securely</h3>
                <p className="text-muted-foreground">
                  Use our built-in messaging to verify ownership and coordinate safe meetups.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Reunite & Return</h3>
                <p className="text-muted-foreground">
                  Mark items as claimed or returned once they're back with their rightful owners.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Built with{' '}
            <span className="text-red-500">❤</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'lost-found-app'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs">© {new Date().getFullYear()} Lost & Found. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
