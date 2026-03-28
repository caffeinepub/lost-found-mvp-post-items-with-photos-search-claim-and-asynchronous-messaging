import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Inbox,
  MapPin,
  MessageSquare,
  PlusCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useGetCallerUserProfile } from "../../hooks/useCurrentUser";
import { useGetAllFeedback, useIsCallerAdmin } from "../../hooks/useFeedback";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetUserConversations } from "../../hooks/useQueries";
import { getInitials, truncatePrincipal } from "../../utils/identity";
import LoginButton from "../auth/LoginButton";

export default function AppHeader() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { unreadCount: unreadFeedbackNum } = useGetAllFeedback();

  const principal = identity?.getPrincipal();
  const { data: conversations = [] } = useGetUserConversations(principal);

  const unreadCount = conversations.reduce((total, convo) => {
    const otherMessages = convo.messages.filter(
      (msg) => msg.sender.toString() !== principal?.toString(),
    );
    return total + otherMessages.length;
  }, 0);

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const isAuthenticated = !!identity;
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) =>
    path === "/" ? currentPath === path : currentPath.startsWith(path);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate({ to: "/browse" })}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <img
                src="/assets/generated/lostfound-logo.dim_512x512.png"
                alt="Lost & Found"
                className="h-10 w-10 rounded-lg"
              />
              <span className="text-xl font-bold tracking-tight">
                Lost & Found
              </span>
            </button>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: "/browse" })}
                  className="gap-2"
                  data-ocid="nav.browse.link"
                >
                  <Search className="h-4 w-4 text-blue-500" />
                  Browse
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <PlusCircle className="h-4 w-4 text-orange-500" />
                      Report Item
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => navigate({ to: "/report/lost" })}
                      data-ocid="nav.report_lost.button"
                    >
                      Report Lost Item
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate({ to: "/report/found" })}
                      data-ocid="nav.report_found.button"
                    >
                      Report Found Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: "/inbox" })}
                  className="gap-2"
                  data-ocid="nav.inbox.link"
                >
                  <span className="relative inline-flex">
                    <Inbox className="h-4 w-4 text-amber-500" />
                    {unreadCount > 0 && (
                      <span
                        data-ocid="nav.inbox.badge"
                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white"
                      >
                        {badgeLabel}
                      </span>
                    )}
                  </span>
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
                        {userProfile ? getInitials(userProfile.name) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {userProfile?.name ||
                        truncatePrincipal(identity.getPrincipal())}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {userProfile?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {truncatePrincipal(identity.getPrincipal())}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/browse" })}>
                    Browse Items
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/inbox" })}>
                    My Inbox
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/feedback" })}
                  >
                    <MessageSquare className="mr-2 h-4 w-4 text-violet-500" />
                    Send Feedback
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        data-ocid="nav.admin.link"
                        onClick={() => navigate({ to: "/admin/feedback" })}
                      >
                        <span className="relative flex items-center gap-2 w-full">
                          <ShieldCheck className="h-4 w-4 text-purple-600" />
                          <span>Admin Dashboard</span>
                          {unreadFeedbackNum > 0 && (
                            <Badge className="ml-auto h-4 px-1.5 text-[10px] bg-blue-500 hover:bg-blue-600 text-white">
                              {unreadFeedbackNum}
                            </Badge>
                          )}
                        </span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {isAuthenticated && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          aria-label="Mobile navigation"
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/browse" })}
            data-ocid="nav.browse.link"
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[60px] ${
              isActive("/browse")
                ? "text-blue-600"
                : "text-muted-foreground hover:text-blue-500"
            }`}
            aria-label="Browse items"
          >
            <Search
              className={`h-5 w-5 transition-transform ${isActive("/browse") ? "scale-110" : ""}`}
            />
            <span className="text-[10px] font-medium leading-none">Browse</span>
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/report/lost" })}
            data-ocid="nav.report_lost.button"
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[60px] ${
              isActive("/report/lost")
                ? "text-orange-600"
                : "text-muted-foreground hover:text-orange-500"
            }`}
            aria-label="Report lost item"
          >
            <MapPin
              className={`h-5 w-5 transition-transform ${isActive("/report/lost") ? "scale-110" : ""}`}
            />
            <span className="text-[10px] font-medium leading-none">Lost</span>
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/report/found" })}
            data-ocid="nav.report_found.button"
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[60px] ${
              isActive("/report/found")
                ? "text-orange-500"
                : "text-muted-foreground hover:text-orange-500"
            }`}
            aria-label="Report found item"
          >
            <PlusCircle
              className={`h-5 w-5 transition-transform ${isActive("/report/found") ? "scale-110" : ""}`}
            />
            <span className="text-[10px] font-medium leading-none">Found</span>
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/inbox" })}
            data-ocid="nav.inbox.link"
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[60px] ${
              isActive("/inbox")
                ? "text-amber-600"
                : "text-muted-foreground hover:text-amber-500"
            }`}
            aria-label="Open inbox"
          >
            <span className="relative inline-flex">
              <Inbox
                className={`h-5 w-5 transition-transform ${isActive("/inbox") ? "scale-110" : ""}`}
              />
              {unreadCount > 0 && (
                <span
                  data-ocid="nav.inbox.badge"
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white"
                >
                  {badgeLabel}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">Inbox</span>
          </button>
        </nav>
      )}
    </>
  );
}
