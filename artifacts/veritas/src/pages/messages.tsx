import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import {
  useListConversations,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Shield, MessageSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MessagesPage() {
  const { user } = useAuth();

  const { data: conversations, isLoading } = useListConversations({
    query: {
      queryKey: getListConversationsQueryKey(),
      enabled: !!user,
      refetchInterval: 5000,
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-[#C9A84C]" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">Your secure conversations</p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading conversations...</div>
        ) : !conversations || conversations.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="p-16 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-base">No conversations yet</p>
              <p className="text-sm mt-1">Messages will appear here once you connect with a client or professional.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link key={conv.userId} href={`/chat/${conv.userId}`}>
                <Card className="hover:shadow-md hover:border-[#1E3A5F]/30 transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center font-bold text-primary text-base shrink-0 group-hover:bg-[#1E3A5F]/15 transition-colors">
                        {conv.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="font-semibold text-primary text-sm">{conv.name}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-[10px] h-5 min-w-5 px-1.5 rounded-full">
                                {conv.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(conv.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-[#C9A84C]" />
            All conversations are monitored. Contact info is automatically detected and blocked.
          </div>
        </div>
      </main>
    </div>
  );
}
