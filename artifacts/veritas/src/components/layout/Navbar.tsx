import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListConversations, getListConversationsQueryKey } from "@workspace/api-client-react";

function MessageBadge() {
  const { data: conversations } = useListConversations({
    query: {
      queryKey: getListConversationsQueryKey(),
      refetchInterval: 5000,
      retry: false,
    }
  });

  const unread = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) ?? 0;

  return (
    <Link href={unread > 0 || (conversations && conversations.length > 0) ? "/messages" : "#"}>
      <Button variant="ghost" className="relative text-primary font-medium hidden sm:flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4" />
        <span className="hidden md:inline">Messages</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>
    </Link>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const isHome = location === "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <Shield className="w-5 h-5 text-[#C9A84C]" />
          <span className="font-bold text-lg tracking-tight text-[#1E3A5F]">VERITAS</span>
        </Link>

        {isHome && (
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#verification" className="hover:text-primary transition-colors">Verification</a>
            <a href="#trust-score" className="hover:text-primary transition-colors">Trust Score</a>
            <a href="#clients" className="hover:text-primary transition-colors">For Clients</a>
            <a href="#professionals" className="hover:text-primary transition-colors">For Professionals</a>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="hidden sm:flex text-primary font-medium">Dashboard</Button>
              </Link>
              <MessageBadge />
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="hidden sm:flex text-primary font-medium">Admin</Button>
                </Link>
              )}
              <Button onClick={() => logout()} variant="outline" className="border-[#1E3A5F]/30 text-primary font-medium hover:bg-primary hover:text-white transition-colors">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" className="text-primary font-medium hover:bg-primary/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 font-medium px-5">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
