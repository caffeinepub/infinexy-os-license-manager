import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useLocalAuth } from "./hooks/useLocalAuth";
import { AuthPage } from "./pages/AuthPage";
import { DashboardLayout } from "./pages/DashboardLayout";

function AppContent() {
  const { identity, isInitializing } = useLocalAuth();

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.24 0.028 220) 0%, oklch(0.18 0.02 220) 100%)",
        }}
      >
        <div className="space-y-3 w-64" data-ocid="app.loading_state">
          <Skeleton
            className="h-10 w-full"
            style={{ background: "oklch(0.35 0.02 220)" }}
          />
          <Skeleton
            className="h-6 w-3/4"
            style={{ background: "oklch(0.35 0.02 220)" }}
          />
          <Skeleton
            className="h-6 w-1/2"
            style={{ background: "oklch(0.35 0.02 220)" }}
          />
        </div>
      </div>
    );
  }

  if (!identity) {
    return <AuthPage />;
  }

  return <DashboardLayout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
