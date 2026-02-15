import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import { Heart } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'lost-found-app'
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30 py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs">© {currentYear} Lost & Found. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
