import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { ItemType } from './backend';
import LandingPage from './pages/LandingPage';
import BrowsePage from './pages/BrowsePage';
import ReportItemPage from './pages/ReportItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import InboxPage from './pages/InboxPage';
import ConversationPage from './pages/ConversationPage';
import FeedbackPage from './pages/FeedbackPage';
import AppLayout from './components/layout/AppLayout';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import { Toaster } from '@/components/ui/sonner';

// Root component with layout for authenticated users
function RootComponent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <AppLayout>
      <ProfileSetupDialog />
      <Outlet />
      <Toaster />
    </AppLayout>
  );
}

// Index route component
function IndexComponent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  
  // Redirect authenticated users to browse page
  if (identity) {
    navigate({ to: '/browse' });
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
  path: '/',
  component: IndexComponent,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowsePage,
});

const reportLostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/report/lost',
  component: () => <ReportItemPage itemType={ItemType.lost} />,
});

const reportFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/report/found',
  component: () => <ReportItemPage itemType={ItemType.found} />,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/item/$itemId',
  component: ItemDetailPage,
});

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: InboxPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/conversation/$conversationId',
  component: ConversationPage,
});

const feedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feedback',
  component: FeedbackPage,
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
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
