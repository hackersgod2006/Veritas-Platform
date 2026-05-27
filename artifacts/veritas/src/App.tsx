import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import DashboardIndex from "@/pages/dashboard";
import ProfessionalDashboard from "@/pages/dashboard/professional";
import ClientDashboard from "@/pages/dashboard/client";
import VerifyPage from "@/pages/verify";
import PostProjectPage from "@/pages/post-project";
import PassportPage from "@/pages/passport/[id]";
import AdminDashboard from "@/pages/admin";
import ChatPage from "@/pages/chat";
import MessagesPage from "@/pages/messages";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/passport/:id" component={PassportPage} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardIndex />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard/professional">
        <ProtectedRoute requireRole="professional">
          <ProfessionalDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard/client">
        <ProtectedRoute requireRole="client">
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/verify">
        <ProtectedRoute requireRole="professional">
          <VerifyPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/post-project">
        <ProtectedRoute requireRole="client">
          <PostProjectPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/messages">
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      </Route>

      <Route path="/chat/:userId">
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
