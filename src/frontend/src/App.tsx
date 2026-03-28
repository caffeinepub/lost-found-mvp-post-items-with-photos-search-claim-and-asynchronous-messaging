import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { ItemType } from "./backend";
import ProfileSetupDialog from "./components/auth/ProfileSetupDialog";
import AppLayout from "./components/layout/AppLayout";
import InstallPrompt from "./components/pwa/InstallPrompt";
import UpdateBanner from "./components/pwa/UpdateBanner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import BrowsePage from "./pages/BrowsePage";
import ConversationPage from "./pages/ConversationPage";
import FeedbackPage from "./pages/FeedbackPage";
import InboxPage from "./pages/InboxPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import LandingPage from "./pages/LandingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ReportItemPage from "./pages/ReportItemPage";

import pwaIconMaskable192 from "/assets/generated/lostitfindit-pwa-icon-maskable.dim_192x192.png";
import pwaIconMaskable512 from "/assets/generated/lostitfindit-pwa-icon-maskable.dim_512x512.png";
// PWA icon imports — imported as modules so the build pipeline always includes them
import pwaIcon192 from "/assets/generated/lostitfindit-pwa-icon.dim_192x192.png";
import pwaIcon512 from "/assets/generated/lostitfindit-pwa-icon.dim_512x512.png";

// Root component with layout for authenticated users
function RootComponent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <>
      {/* Hidden PWA icon references — always rendered to prevent build pruning */}
      <div style={{ display: "none" }} aria-hidden="true">
        <img src={pwaIcon192} alt="" />
        <img src={pwaIcon512} alt="" />
        <img src={pwaIconMaskable192} alt="" />
        <img src={pwaIconMaskable512} alt="" />
      </div>
      <UpdateBanner />
      {isAuthenticated ? (
        <AppLayout>
          <ProfileSetupDialog />
          <Outlet />
          <Toaster />
          <InstallPrompt />
        </AppLayout>
      ) : (
        <Outlet />
      )}
    </>
  );
}

// Index route component
function IndexComponent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  // Redirect authenticated users to browse page
  if (identity) {
    navigate({ to: "/browse" });
    return null;
  }

  return <LandingPage />;
}

// Root route with layout for authenticated users
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse",
  component: BrowsePage,
});

const reportLostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/report/lost",
  component: () => <ReportItemPage itemType={ItemType.lost} />,
});

const reportFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/report/found",
  component: () => <ReportItemPage itemType={ItemType.found} />,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/item/$itemId",
  component: ItemDetailPage,
});

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inbox",
  component: InboxPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conversation/$conversationId",
  component: ConversationPage,
});

const feedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feedback",
  component: FeedbackPage,
});

const adminFeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/feedback",
  component: AdminFeedbackPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPolicyPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  reportLostRoute,
  reportFoundRoute,
  itemDetailRoute,
  inboxRoute,
  conversationRoute,
  feedbackRoute,
  adminFeedbackRoute,
  privacyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
