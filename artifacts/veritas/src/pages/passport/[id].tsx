import { useGetPassport, getGetPassportQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Shield, CheckCircle, Award, Star, Briefcase, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function PassportPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: passport, isLoading, error } = useGetPassport(id || "", {
    query: {
      enabled: !!id,
      queryKey: getGetPassportQueryKey(id || ""),
      retry: false
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading Trust Passport...</div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h1 className="text-2xl font-bold text-primary mb-2">Passport Not Found</h1>
          <p className="text-muted-foreground">This trust passport does not exist or has been revoked.</p>
        </div>
      </div>
    );
  }

  const getTierStyle = (tier: string | null | undefined) => {
    switch (tier?.toLowerCase()) {
      case 'elite': return { ring: 'border-[#C9A84C]', bg: 'bg-[#C9A84C]/10', text: 'text-[#C9A84C]' };
      case 'advanced': return { ring: 'border-[#1E3A5F]', bg: 'bg-[#1E3A5F]/10', text: 'text-[#1E3A5F]' };
      case 'trusted': return { ring: 'border-green-600', bg: 'bg-green-50', text: 'text-green-700' };
      default: return { ring: 'border-muted-foreground', bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  const tierStyle = getTierStyle(passport.tier);
  const isClient = user?.role === "client";
  const isLoggedIn = !!user;

  const handleHire = () => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    if (passport.userId) {
      navigate(`/chat/${passport.userId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header Banner */}
        <div className="bg-[#1E3A5F] text-white p-8 rounded-t-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Shield className="w-48 h-48" />
          </div>
          <Shield className="w-12 h-12 text-[#C9A84C] mx-auto mb-4 relative z-10" />
          <p className="text-xs uppercase tracking-widest text-white/60 mb-2 relative z-10">Veritas Verified Trust Passport</p>
          <h2 className="text-3xl font-bold mb-1 relative z-10">{passport.displayName}</h2>
          {passport.skillsCategory && (
            <p className="text-white/70 text-sm relative z-10">{passport.skillsCategory}</p>
          )}
        </div>

        <Card className="rounded-t-none border-t-0 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-12 items-start">

              {/* Score Column */}
              <div className="flex flex-col items-center">
                <div className={`w-52 h-52 rounded-full border-8 ${tierStyle.ring} flex flex-col items-center justify-center mb-5 ${tierStyle.bg} shadow-inner`}>
                  <span className="text-6xl font-bold text-primary tracking-tighter">{passport.trustScore ?? "—"}</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Trust Score</span>
                </div>
                <Badge variant="outline" className={`${tierStyle.text} ${tierStyle.ring} ${tierStyle.bg} uppercase tracking-widest px-6 py-2 text-sm font-bold border`}>
                  {passport.tier || "Verified"} Tier
                </Badge>
              </div>

              {/* Details Column */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Verification Status</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Identity Verified", value: passport.identityVerified },
                      { label: "Skills Assessed", value: passport.skillsAssessed },
                      { label: "Background Cleared", value: passport.backgroundCleared },
                      { label: "Integrity Confirmed", value: passport.integrityConfirmed },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${value ? 'text-green-600' : 'text-muted-foreground/30'}`} />
                        <span className="font-medium text-primary text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1"><Briefcase className="w-3 h-3"/> Projects</div>
                      <span className="text-2xl font-bold text-primary">{passport.projectsCompleted}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1"><Award className="w-3 h-3"/> Delivery</div>
                      <span className="text-2xl font-bold text-primary">{passport.deliveryRate ? `${passport.deliveryRate}%` : 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1"><Star className="w-3 h-3"/> Satisfaction</div>
                      <span className="text-2xl font-bold text-primary">{passport.clientSatisfaction ? `${passport.clientSatisfaction}/5.0` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hire / Contact CTA */}
            <div className="mt-10 pt-8 border-t border-border">
              {isClient ? (
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 h-14 text-base font-semibold"
                    onClick={handleHire}
                  >
                    Hire This Professional — Message Now
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    You'll be connected instantly via Veritas Secure Messaging.
                  </p>
                </div>
              ) : !isLoggedIn ? (
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 h-14 text-base font-semibold"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In to Hire This Professional
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Enterprise clients — <button onClick={() => navigate("/auth?tab=register")} className="underline font-medium hover:text-primary">register a client account</button> to access verified talent.
                  </p>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-xl p-4 text-center text-sm text-muted-foreground">
                  This is your Trust Passport — clients can use it to contact you for projects.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Veritas backing notice */}
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[#C9A84C]" />
            <span className="font-semibold text-primary">Verified and backed by Veritas Infrastructure Systems, Inc.</span>
          </div>
          <p className="text-xs">Delaware C-Corp · Institutional-grade compliance · US entity counterparty</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
