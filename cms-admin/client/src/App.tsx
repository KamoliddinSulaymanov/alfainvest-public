import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Loader2 } from "lucide-react";

const NotFound      = lazy(() => import("@/pages/NotFound"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const LoginPage     = lazy(() => import("./pages/LoginPage"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const PagesManager  = lazy(() => import("./pages/PagesManager"));
const ProductsManager = lazy(() => import("./pages/ProductsManager"));
const NewsManager   = lazy(() => import("./pages/NewsManager"));
const MediaLibrary  = lazy(() => import("./pages/MediaLibrary"));
const BranchesManager = lazy(() => import("./pages/BranchesManager"));
const UsersManager  = lazy(() => import("./pages/UsersManager"));
const SettingsPage  = lazy(() => import("./pages/SettingsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

function LoadingScreen({ label = "Loading CMS..." }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin" && user.role !== "editor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the CMS admin panel.</p>
          <p className="text-sm text-muted-foreground">Contact your administrator to get access.</p>
        </div>
      </div>
    );
  }

  return (
    <LazyPage>
      <DashboardLayout>
        <Switch>
          <Route path="/" component={DashboardHome} />
          <Route path="/pages" component={PagesManager} />
          <Route path="/products" component={ProductsManager} />
          <Route path="/news" component={NewsManager} />
          <Route path="/media" component={MediaLibrary} />
          <Route path="/branches" component={BranchesManager} />
          <Route path="/users" component={UsersManager} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </LazyPage>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Switch>
            <Route path="/login">
              {() => <LazyPage><LoginPage /></LazyPage>}
            </Route>
            <Route component={ProtectedApp} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
