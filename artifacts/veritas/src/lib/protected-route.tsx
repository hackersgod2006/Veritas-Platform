import { useAuth } from "./auth";
import { Redirect } from "wouter";

export function ProtectedRoute({ 
  children, 
  requireRole, 
  requireAdmin 
}: { 
  children: React.ReactNode, 
  requireRole?: "professional" | "client", 
  requireAdmin?: boolean 
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (requireAdmin && !user?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
