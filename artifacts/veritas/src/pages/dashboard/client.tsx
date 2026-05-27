import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import {
  useListMyProjects,
  useListProfessionals,
  useListApplicationsForMyProjects,
  useUpdateApplicationStatus,
  getListMyProjectsQueryKey,
  getListProfessionalsQueryKey,
  getListApplicationsForMyProjectsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  PlusCircle, Shield, Star, Briefcase, Award, ExternalLink,
  CheckCircle, MessageSquare, Bell, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Professional = {
  id: number;
  userId: number;
  name: string;
  email: string;
  country: string | null;
  bio: string | null;
  skillsCategory: string | null;
  proficiencyLevel: string | null;
  portfolioLinks?: string[];
  trustScore: number | null;
  tier: string | null;
  projectsCompleted: number;
  deliveryRate: number | null;
  clientSatisfaction: number | null;
  passportId: string | null;
  verificationStatus: string;
};

type Tab = "projects" | "talent" | "applications";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);

  const { data: myProjects } = useListMyProjects({
    query: { queryKey: getListMyProjectsQueryKey(), enabled: !!user }
  });

  const { data: professionalsData } = useListProfessionals({}, {
    query: { queryKey: getListProfessionalsQueryKey({}), enabled: !!user }
  });

  const { data: applications } = useListApplicationsForMyProjects({
    query: { queryKey: getListApplicationsForMyProjectsQueryKey(), enabled: !!user }
  });

  const statusMutation = useUpdateApplicationStatus();

  const handleAccept = (applicationId: number, professionalUserId: number) => {
    statusMutation.mutate({ applicationId, data: { status: "accepted" } }, {
      onSuccess: () => {
        toast.success("Application Accepted", {
          description: "The professional has been notified. You can now message them directly.",
        });
        queryClient.invalidateQueries({ queryKey: getListApplicationsForMyProjectsQueryKey() });
        navigate(`/chat/${professionalUserId}`);
      },
      onError: () => toast.error("Could not update application")
    });
  };

  const handleShortlist = (applicationId: number) => {
    statusMutation.mutate({ applicationId, data: { status: "shortlisted" } }, {
      onSuccess: () => {
        toast.success("Added to Shortlist");
        queryClient.invalidateQueries({ queryKey: getListApplicationsForMyProjectsQueryKey() });
      },
      onError: () => toast.error("Could not update application")
    });
  };

  const pendingCount = applications?.filter(a => a.status === "pending").length ?? 0;

  const getTierColor = (tier: string | null) => {
    switch (tier?.toLowerCase()) {
      case 'elite': return 'text-[#C9A84C] border-[#C9A84C] bg-[#C9A84C]/10';
      case 'advanced': return 'text-blue-700 border-blue-300 bg-blue-50';
      case 'trusted': return 'text-green-700 border-green-300 bg-green-50';
      default: return 'text-muted-foreground border-border bg-muted';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted': return 'border-green-300 text-green-700 bg-green-50';
      case 'shortlisted': return 'border-blue-300 text-blue-700 bg-blue-50';
      case 'rejected': return 'border-red-300 text-red-700 bg-red-50';
      default: return 'border-amber-300 text-amber-700 bg-amber-50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Client Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage projects and hire verified talent</p>
          </div>
          <Link href="/post-project">
            <Button className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 gap-2">
              <PlusCircle className="w-4 h-4" /> Post a Project
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          {([
            { id: "projects" as Tab, label: "My Projects", icon: Briefcase, badge: undefined as number | undefined },
            { id: "applications" as Tab, label: "Applications", icon: Bell, badge: pendingCount > 0 ? pendingCount : undefined as number | undefined },
            { id: "talent" as Tab, label: "Browse Talent", icon: Shield, badge: undefined as number | undefined },
          ]).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? "border-[#1E3A5F] text-[#1E3A5F]"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge !== undefined && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: My Projects */}
        {activeTab === "projects" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProjects && myProjects.length > 0 ? (
              myProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
                      <Badge variant="outline" className={`capitalize shrink-0 text-xs ${project.status === 'open' ? 'border-green-300 text-green-700 bg-green-50' : ''}`}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex justify-between items-center text-sm font-medium text-primary">
                      <span>${project.budgetMin}–${project.budgetMax}/hr</span>
                      <span className="text-muted-foreground text-xs">{project.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full border-dashed bg-transparent shadow-none">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground font-medium">No active projects yet</p>
                  <Link href="/post-project">
                    <Button className="mt-4 bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 gap-2">
                      <PlusCircle className="w-4 h-4" /> Post a Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tab: Applications */}
        {activeTab === "applications" && (
          <div className="space-y-3">
            {!applications || applications.length === 0 ? (
              <Card className="border-dashed bg-transparent shadow-none">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No applications received yet</p>
                  <p className="text-sm mt-1">When professionals apply to your projects, they appear here.</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => (
                <Card key={app.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                            {app.professionalName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-primary text-sm">{app.professionalName}</p>
                            {app.skillsCategory && (
                              <p className="text-xs text-muted-foreground">{app.skillsCategory}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${getStatusStyle(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                          {app.tier && (
                            <Badge variant="outline" className={`text-xs ${getTierColor(app.tier)}`}>
                              {app.tier} Tier
                            </Badge>
                          )}
                          {app.trustScore && (
                            <Badge variant="secondary" className="text-xs">
                              Score {app.trustScore}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Applied to: <span className="font-medium text-foreground">{app.projectTitle}</span>
                          {" "}· {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        {app.passportId && (
                          <Link href={`/passport/${app.passportId}`}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs w-full">
                              <Shield className="w-3 h-3" /> View Passport
                            </Button>
                          </Link>
                        )}
                        {app.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-700 border-blue-300 hover:bg-blue-50 gap-1 text-xs"
                            onClick={() => handleShortlist(app.id)}
                            disabled={statusMutation.isPending}
                          >
                            Shortlist
                          </Button>
                        )}
                        {(app.status === "pending" || app.status === "shortlisted") && (
                          <Button
                            size="sm"
                            className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 gap-1 text-xs"
                            onClick={() => handleAccept(app.id, app.professionalUserId)}
                            disabled={statusMutation.isPending}
                          >
                            <CheckCircle className="w-3 h-3" /> Accept & Message
                          </Button>
                        )}
                        {app.status === "accepted" && (
                          <Link href={`/chat/${app.professionalUserId}`}>
                            <Button size="sm" className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 gap-1 text-xs w-full">
                              <MessageSquare className="w-3 h-3" /> Message
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab: Browse Talent */}
        {activeTab === "talent" && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-[#C9A84C]" />
              <h2 className="text-xl font-semibold text-primary">Verified Talent Pool</h2>
              {professionalsData?.professionals && (
                <span className="text-sm text-muted-foreground">({professionalsData.professionals.length} verified)</span>
              )}
            </div>

            {(!professionalsData?.professionals || professionalsData.professionals.length === 0) ? (
              <Card className="border-dashed bg-transparent shadow-none">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No verified professionals yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {professionalsData.professionals.map((prof) => (
                  <Card
                    key={prof.id}
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:border-[#1E3A5F]/30 group"
                    onClick={() => setSelectedPro(prof as Professional)}
                  >
                    <div className="h-1.5 bg-[#1E3A5F] group-hover:bg-[#C9A84C] transition-colors" />
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-primary truncate">{prof.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{prof.skillsCategory || "Verified Professional"}</p>
                        </div>
                        <div className="w-11 h-11 rounded-full border-2 border-[#C9A84C] flex items-center justify-center font-bold text-primary bg-[#C9A84C]/5 text-sm shrink-0 ml-2">
                          {prof.trustScore ?? "—"}
                        </div>
                      </div>
                      {prof.tier && (
                        <Badge variant="outline" className={`mb-3 text-xs ${getTierColor(prof.tier)}`}>
                          {prof.tier} Tier
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{prof.bio}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-[#1E3A5F]/30 text-primary hover:bg-[#1E3A5F] hover:text-white transition-colors text-xs"
                        onClick={(e) => { e.stopPropagation(); setSelectedPro(prof as Professional); }}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Professional Detail Modal */}
      <Dialog open={!!selectedPro} onOpenChange={(open) => !open && setSelectedPro(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">{selectedPro?.name}</DialogTitle>
            <DialogDescription>{selectedPro?.skillsCategory}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="w-16 h-16 rounded-full border-4 border-[#C9A84C] flex items-center justify-center font-bold text-2xl text-primary bg-white shrink-0">
                {selectedPro?.trustScore ?? "—"}
              </div>
              <div>
                {selectedPro?.tier && (
                  <Badge variant="outline" className={`${getTierColor(selectedPro.tier)} uppercase tracking-wider font-semibold mb-2`}>
                    {selectedPro.tier} TIER
                  </Badge>
                )}
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1 text-green-700"><CheckCircle className="w-3 h-3"/> Identity Verified</div>
                  <div className="flex items-center gap-1 text-green-700"><CheckCircle className="w-3 h-3"/> Skills Assessed</div>
                  <div className="flex items-center gap-1 text-green-700"><CheckCircle className="w-3 h-3"/> Background Cleared</div>
                </div>
              </div>
            </div>

            {selectedPro?.bio && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Professional Summary</h4>
                <p className="text-sm text-foreground leading-relaxed">{selectedPro.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1"><Briefcase className="w-3 h-3"/> Projects</div>
                <div className="font-bold text-primary">{selectedPro?.projectsCompleted ?? 0}</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1"><Award className="w-3 h-3"/> Delivery</div>
                <div className="font-bold text-primary">{selectedPro?.deliveryRate ? `${selectedPro.deliveryRate}%` : "N/A"}</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1"><Star className="w-3 h-3"/> Rating</div>
                <div className="font-bold text-primary">{selectedPro?.clientSatisfaction ? `${selectedPro.clientSatisfaction}/5` : "N/A"}</div>
              </div>
            </div>

            {selectedPro?.portfolioLinks && selectedPro.portfolioLinks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Portfolio</h4>
                <div className="space-y-1">
                  {selectedPro.portfolioLinks.map((link, i) => (
                    <a key={i} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedPro(null)}>Close</Button>
            {selectedPro?.userId && (
              <Link href={`/chat/${selectedPro.userId}`} onClick={() => setSelectedPro(null)}>
                <Button className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 gap-2">
                  <MessageSquare className="w-4 h-4" /> Message Professional
                </Button>
              </Link>
            )}
            {selectedPro?.passportId && (
              <Link href={`/passport/${selectedPro.passportId}`} onClick={() => setSelectedPro(null)}>
                <Button variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" /> Full Passport
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
