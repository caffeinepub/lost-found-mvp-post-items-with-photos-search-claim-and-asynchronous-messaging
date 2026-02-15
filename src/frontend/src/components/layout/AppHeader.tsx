import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUser';
import LoginButton from '../auth/LoginButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, Inbox, MessageSquare } from 'lucide-react';
import { getInitials, truncatePrincipal } from '../../utils/identity';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate({ to: '/browse' })}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <img
              src="/assets/generated/lostfound-logo.dim_512x512.png"
              alt="Lost & Found"
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight">Lost & Found</span>
          </button>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/browse' })}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Browse
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Report Item
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => navigate({ to: '/report/lost' })}>
                    Report Lost Item
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/report/found' })}>
                    Report Found Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/inbox' })}
                className="gap-2"
              >
                <Inbox className="h-4 w-4" />
                Inbox
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && identity && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userProfile ? getInitials(userProfile.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {userProfile?.name || truncatePrincipal(identity.getPrincipal())}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {truncatePrincipal(identity.getPrincipal())}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/browse' })}>
                  Browse Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/inbox' })}>
                  My Inbox
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/feedback' })}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Feedback
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
