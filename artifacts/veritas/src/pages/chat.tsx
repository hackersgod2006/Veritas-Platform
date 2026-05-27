import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import {
  useGetConversation,
  useSendMessage,
  getGetConversationQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Send, AlertTriangle, Ban, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const BLOCKED_PATTERNS = [
  { pattern: /(\+?[\d][\d\s\-\(\)\.]{7,}[\d])/, label: "phone numbers" },
  { pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/, label: "email addresses" },
  { pattern: /\b(skype|discord|telegram|whatsapp|signal|instagram|snapchat|facebook|wechat|viber)\b/i, label: "external platform references" },
  { pattern: /\b(call me|text me|my number|phone me|reach me at|contact me at|outside (this|the) platform|off.?platform)\b/i, label: "off-platform contact attempts" },
];

function detectBlocked(text: string): string | null {
  for (const { pattern, label } of BLOCKED_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  return null;
}

export default function ChatPage() {
  const { userId: otherUserIdStr } = useParams<{ userId: string }>();
  const otherUserId = parseInt(otherUserIdStr || "0");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [warningDismissed, setWarningDismissed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading } = useGetConversation(otherUserId, {
    query: {
      queryKey: getGetConversationQueryKey(otherUserId),
      enabled: !!otherUserId && !!user,
      refetchInterval: 4000,
    }
  });

  const sendMutation = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const blockedType = detectBlocked(trimmed);
    if (blockedType) {
      toast.error("Message blocked", {
        description: `Your message contains ${blockedType}. Sharing contact information or attempting to move communication off-platform is strictly prohibited and may result in a permanent ban.`,
        duration: 6000,
      });
      return;
    }

    sendMutation.mutate({ data: { receiverId: otherUserId, content: trimmed } }, {
      onSuccess: () => {
        setMessage("");
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(otherUserId) });
      },
      onError: (err: unknown) => {
        const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
          || (err instanceof Error ? err.message : "Message could not be sent");
        toast.error("Message blocked", { description: errMsg });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherName = conversation?.otherUser?.name || "...";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-3xl flex-1 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/messages")}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center font-bold text-primary shrink-0">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-primary text-lg">{otherName}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#C9A84C]" /> Veritas Secure Messaging
            </p>
          </div>
        </div>

        {/* Safety Warnings */}
        {!warningDismissed && (
          <div className="space-y-3 mb-4">
            <div className="border border-red-200 bg-red-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 text-sm mb-1">No Off-Platform Contact — Zero Exceptions</p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Sharing phone numbers, email addresses, social media handles, or any attempt to move this conversation off Veritas is <strong>strictly prohibited</strong> and will result in <strong>permanent account termination</strong>. All messages are monitored automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm mb-1">Notice to Clients</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    If the professional asks you to contact them outside this platform, <strong>do not comply</strong>. Report it to{" "}
                    <a href="mailto:masmat170290@gmail.com" className="font-bold underline">masmat170290@gmail.com</a>.
                    Off-platform communication is outside Veritas jurisdiction and liability.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setWarningDismissed(true)}>
                I understand, proceed to chat
              </Button>
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 bg-gray-50 rounded-xl border border-border p-4 min-h-[300px] max-h-[500px] overflow-y-auto flex flex-col gap-3 mb-4">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading conversation...</div>
          ) : !conversation?.messages || conversation.messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Shield className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation below.</p>
            </div>
          ) : (
            conversation.messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isMe
                      ? "bg-[#1E3A5F] text-white rounded-br-sm"
                      : "bg-white border border-border text-foreground rounded-bl-sm shadow-sm"
                  )}>
                    {msg.content}
                    <div className={cn("text-xs mt-1", isMe ? "text-white/50 text-right" : "text-muted-foreground")}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-end">
          <Textarea
            className="flex-1 resize-none min-h-[48px] max-h-[120px] rounded-xl"
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <Button
            className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 h-12 px-4 rounded-xl shrink-0"
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          All messages are monitored. Contact info detection is automatic. Violations result in permanent ban.
        </p>
      </div>
    </div>
  );
}
