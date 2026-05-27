import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import {
  useGetMyProfessionalProfile,
  useListProjects,
  useApplyToProject,
  useListConversations,
  getGetMyProfessionalProfileQueryKey,
  getListProjectsQueryKey,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle, Shield, AlertCircle, Clock, DollarSign, Tag,
  Send, Briefcase, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Project = {
  id: number;
  title: string;
  description: string;
  skillsRequired?: string[];
  duration: string;
  budgetMin: number;
  budgetMax: number;
  preferredTier: string;
  status: string;
};

type Tab = "opportunities" | "messages";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("opportunities");

  const { data: profile, isLoading } = useGetMyProfessionalProfile({
    query: {
      queryKey: getGetMyProfessionalProfileQueryKey(),
      enabled: !!user,
      retry: false,
    }
  });

  const { data: projectsData } = useListProjects({}, {
    query: {
      queryKey: getListProjectsQueryKey({}),
      enabled: !!user,
    }
  });

  const { data: conversations } = useListConversations({
    query: {
      queryKey: getListConversationsQueryKey(),
      enabled: !!user,
      refetchInterval: 5000,
    }
  });

  const applyMutation = useApplyToProject();

  const handleApply = () => {
    if (!selectedProject) return;
    setApplying(true);
    applyMutation.mutate({ data: { projectId: selectedProject.id } }, {
      onSuccess: () => {
        toast.success("Application Submitted", {
          description: "The client has been notified. You will hear back within 48 hours.",
        });
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey({}) });
        setSelectedProject(null);
        setApplying(false);
      },
      onError: () => {
        toast.error("Could not apply", {
          description: "You may have already applied to this project.",
        });
        setApplying(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading your profile...</div>
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === "verified";
  const isPending = profile?.verificationStatus === "pending";
  const unreadTotal = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Professional Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your Trust Passport and enterprise opportunities</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Trust Passport */}
          <div className="md:col-span-1 space-y-4">
            <Card className={`border-2 ${isVerified ? 'border-[#C9A84C]/40' : 'border-border'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Shield className="w-5 h-5 text-[#C9A84C]" />
                  Trust Passport
                </CardTitle>
                <CardDescription>Your institutional credential</CardDescription>
              </CardHeader>
              <CardContent>
                {isVerified ? (
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 rounded-full border-4 border-[#C9A84C] mx-auto flex items-center justify-center bg-primary/5 shadow-inner">
                      <div className="text-4xl font-bold text-primary">{profile?.trustScore ?? "—"}</div>
                    </div>
                    <Badge variant="outline" className="bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30 uppercase tracking-widest px-4 py-1 font-semibold">
                      {profile?.tier || "VERIFIED"}
                    </Badge>
                    <div className="space-y-2 mt-4 text-sm text-left">
                      <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Identity Verified</div>
                      <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Skills Assessed</div>
                      <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Background Cleared</div>
                      <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Integrity Confirmed</div>
                    </div>
                    <Link href={`/passport/${profile?.passportId}`}>
                      <Button className="w-full mt-4" variant="outline">View Public Passport</Button>
                    </Link>
                  </div>
                ) : isPending ? (
                  <div className="text-center space-y-4 py-4">
                    <Clock className="w-10 h-10 text-[#C9A84C] mx-auto" />
                    <h3 className="font-semibold text-lg text-primary">Under Review</h3>
                    <p className="text-sm text-muted-foreground">Your application is being reviewed by our verification team. Typically 48 hours.</p>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending Review</Badge>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
                    <h3 className="font-semibold text-lg text-primary">Not Verified</h3>
                    <p className="text-sm text-muted-foreground">Complete the vetting process to unlock enterprise opportunities and your Trust Passport.</p>
                    <Link href="/verify">
                      <Button className="w-full bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 mt-2">
                        Start Verification
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {isVerified && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><Briefcase className="w-3 h-3"/> Projects</div>
                      <div className="text-2xl font-bold text-primary">{profile?.projectsCompleted ?? 0}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><CheckCircle className="w-3 h-3"/> Delivery</div>
                      <div className="text-2xl font-bold text-primary">{profile?.deliveryRate ? `${profile.deliveryRate}%` : "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Tabs */}
          <div className="md:col-span-2">
            {/* Tab headers */}
            <div className="flex gap-1 border-b border-border mb-6">
              {([
                { id: "opportunities" as Tab, label: "Open Opportunities", icon: Briefcase, badge: undefined as number | undefined },
                { id: "messages" as Tab, label: "Messages", icon: MessageSquare, badge: unreadTotal > 0 ? unreadTotal : undefined },
              ]).map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? "border-[#1E3A5F] text-[#1E3A5F]"
                      : "border-transparent text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge !== undefined && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: Opportunities */}
            {activeTab === "opportunities" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{projectsData?.projects?.length ?? 0} available</span>
                </div>

                {projectsData?.projects && projectsData.projects.length > 0 ? (
                  projectsData.projects.map((project) => (
                    <Card key={project.id} className="hover:border-[#1E3A5F]/30 hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedProject(project as Project)}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-primary text-base mb-1">{project.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                <Clock className="w-3 h-3 mr-1"/>{project.duration}
                              </Badge>
                              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                <DollarSign className="w-3 h-3 mr-1"/>${project.budgetMin}–${project.budgetMax}/hr
                              </Badge>
                              {project.preferredTier && (
                                <Badge variant="outline" className="text-xs border-[#C9A84C]/40 text-[#C9A84C]">
                                  {project.preferredTier}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="shrink-0 border-[#1E3A5F]/30 text-primary hover:bg-primary hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedProject(project as Project); }}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-dashed bg-transparent shadow-none">
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No open projects yet</p>
                      <p className="text-sm mt-1">Enterprise opportunities will appear here once clients post projects.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Tab: Messages */}
            {activeTab === "messages" && (
              <div className="space-y-2">
                {!conversations || conversations.length === 0 ? (
                  <Card className="border-dashed bg-transparent shadow-none">
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No messages yet</p>
                      <p className="text-sm mt-1">When a client accepts your application and messages you, it appears here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  conversations.map((conv) => (
                    <Link key={conv.userId} href={`/chat/${conv.userId}`}>
                      <Card className="hover:shadow-md hover:border-[#1E3A5F]/30 transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center font-bold text-primary shrink-0 group-hover:bg-[#1E3A5F]/15 transition-colors">
                              {conv.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className="font-semibold text-primary text-sm">{conv.name}</p>
                                <div className="flex items-center gap-2 shrink-0">
                                  {conv.unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
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
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">{selectedProject?.title}</DialogTitle>
            <DialogDescription>Enterprise project opportunity</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <p className="text-sm text-foreground leading-relaxed">{selectedProject?.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><Clock className="w-3 h-3"/> Duration</div>
                <div className="font-semibold text-primary text-sm">{selectedProject?.duration}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><DollarSign className="w-3 h-3"/> Budget</div>
                <div className="font-semibold text-primary text-sm">${selectedProject?.budgetMin}–${selectedProject?.budgetMax}/hr</div>
              </div>
            </div>

            {selectedProject?.skillsRequired && selectedProject.skillsRequired.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Tag className="w-3 h-3"/> Required Skills</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skillsRequired.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedProject?.preferredTier && (
              <div className="border border-[#C9A84C]/30 bg-[#C9A84C]/5 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Preferred Tier: </span>
                <span className="font-semibold text-[#C9A84C]">{selectedProject.preferredTier}</span>
              </div>
            )}

            {!isVerified && (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                You must be verified to apply. <Link href="/verify" className="font-semibold underline">Start verification</Link>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedProject(null)}>Close</Button>
            <Button
              className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 gap-2"
              disabled={!isVerified || applying}
              onClick={handleApply}
            >
              <Send className="w-4 h-4" />
              {applying ? "Submitting..." : "Apply to This Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
