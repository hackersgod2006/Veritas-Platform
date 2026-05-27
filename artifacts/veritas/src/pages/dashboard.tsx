import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";

export default function DashboardIndex() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.isAdmin) {
    return <Redirect to="/admin" />;
  }

  if (user.role === "professional") {
    return <Redirect to="/dashboard/professional" />;
  }

  if (user.role === "client") {
    return <Redirect to="/dashboard/client" />;
  }

  return <Redirect to="/auth" />;
}
