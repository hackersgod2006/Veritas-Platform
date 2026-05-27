import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Star, Clock, Lock, Users } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-32 px-4 container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-medium text-sm mb-8">
              <Shield className="w-4 h-4" />
              <span>The Trust Layer for Global Talent</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight mb-4">
              Trust is the credential.
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-8">
              Not the country.
            </h2>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Veritas Infrastructure provides institutional-grade legal, financial, and verification frameworks connecting enterprise clients with world-class global professionals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/auth?tab=register&role=client">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-medium bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90">
                  Hire Verified Talent
                </Button>
              </Link>
              <Link href="/auth?tab=register&role=professional">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-medium border-2 border-[#1E3A5F] text-primary">
                  Build Your Passport
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-primary/10" />
                  </div>
                ))}
              </div>
              <span className="font-medium">Join the founding professional community</span>
            </div>
          </motion.div>
        </section>

        {/* Stats Band */}
        <section className="bg-[#1E3A5F] py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-2">$8.5T</div>
                <div className="text-sm font-medium text-white/70 uppercase tracking-wider">Global Freelance Market</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-2">1.57B</div>
                <div className="text-sm font-medium text-white/70 uppercase tracking-wider">Freelancers Worldwide</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-2">$28.8T</div>
                <div className="text-sm font-medium text-white/70 uppercase tracking-wider">Projected by 2033</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-2">163M</div>
                <div className="text-sm font-medium text-white/70 uppercase tracking-wider">Platform Profiles</div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Three Structural Failures. One Compounding Crisis.</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The current infrastructure for global talent is fundamentally broken, relying on proxies rather than proof.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "The Legal Zero-Anchor", desc: "Enterprise legal teams cannot underwrite contracts with unknown entities in volatile jurisdictions. They require a US entity counterparty." },
                { title: "The Verification Deficit", desc: "Global platforms optimize for volume, not signal. The resulting noise makes it impossible for procurement teams to confidently vet talent." },
                { title: "Broken Financial Rails", desc: "Cross-border payments remain slow, opaque, and expensive, destroying the economic arbitrage of global hiring." }
              ].map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-xl border border-border shadow-sm">
                  <h3 className="text-xl font-bold text-primary mb-4">{card.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4">
            <div id="verification" className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">The 4-Stage Verification Engine</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Our proprietary process ensures every Trust Passport represents a verified, capable professional.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Identity", desc: "Government ID and biometrics verification against global watchlists." },
                { title: "Skills", desc: "Technical assessments and peer-reviewed portfolio validation." },
                { title: "Background", desc: "Employment history and educational credential verification." },
                { title: "Integrity", desc: "Continuous monitoring of delivery metrics and client satisfaction." }
              ].map((stage, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">{i + 1}</div>
                    <h3 className="font-bold text-primary mb-2">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground">{stage.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Score */}
        <section id="trust-score" className="py-24 bg-[#1E3A5F] text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">The New Standard for Global Talent</h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                  The Veritas Trust Score dynamically aggregates continuous verification signals, delivery metrics, and client satisfaction into a single, institutional-grade metric.
                </p>
                <div className="space-y-4">
                  {[
                    { label: "Elite", range: "801 – 1000", color: "text-[#C9A84C]" },
                    { label: "Advanced", range: "601 – 800", color: "text-white" },
                    { label: "Trusted", range: "401 – 600", color: "text-green-400" },
                    { label: "Emerging", range: "0 – 400", color: "text-white/50" },
                  ].map((tier) => (
                    <div key={tier.label} className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/10">
                      <span className={`font-bold ${tier.color}`}>{tier.label}</span>
                      <span className="font-mono text-white/80">{tier.range}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-72 h-72 rounded-full border-8 border-white/10 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-t-8 border-[#C9A84C] rotate-45"></div>
                  <span className="text-7xl font-bold tracking-tighter text-white">845</span>
                  <span className="text-[#C9A84C] font-bold tracking-widest mt-2 uppercase text-sm">Elite Tier</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for Both Sides */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Built for Both Sides</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card id="clients" className="border-2 border-[#1E3A5F]">
                <CardContent className="p-10">
                  <h3 className="text-2xl font-bold text-primary mb-4">For Clients</h3>
                  <p className="text-muted-foreground mb-6">Contract with a US Delaware C-Corp. Eliminate compliance risk, guarantee delivery, and access the top 1% of verified global talent.</p>
                  <ul className="space-y-3 mb-8">
                    {["US Entity Counterparty", "Verified Talent Pool", "Automated Compliance", "Milestone-Protected Payments"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium"><CheckCircle className="w-4 h-4 text-green-600" />{f}</li>
                    ))}
                  </ul>
                  <Link href="/auth?tab=register&role=client">
                    <Button className="w-full bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90">Start Hiring</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card id="professionals" className="bg-[#1E3A5F] text-white border-none">
                <CardContent className="p-10">
                  <h3 className="text-2xl font-bold text-white mb-4">For Professionals</h3>
                  <p className="text-white/80 mb-6">Turn your expertise into an institutional credential. Bypass geographic bias and access high-paying enterprise contracts.</p>
                  <ul className="space-y-3 mb-8">
                    {["Portable Trust Passport", "Enterprise Projects", "Guaranteed Payments", "Global Banking Rails"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium text-white"><CheckCircle className="w-4 h-4 text-[#C9A84C]" />{f}</li>
                    ))}
                  </ul>
                  <Link href="/auth?tab=register&role=professional">
                    <Button className="w-full bg-[#C9A84C] text-[#1E3A5F] hover:bg-[#C9A84C]/90 font-semibold">Apply for Passport</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Veritas Delivery Promise */}
        <section className="py-24 border-t border-border bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">The Veritas Delivery Promise</h2>
              <p className="text-lg text-muted-foreground">We put our reputation where our trust is.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 border border-border rounded-xl p-6">
                <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-[#1E3A5F]" />
                </div>
                <h3 className="font-bold text-primary text-base mb-2">48-Hour Replacement</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">If your assigned professional underperforms or goes offline, we replace them with a verified professional of equal or higher tier within 48 hours. At zero cost to you.</p>
              </div>

              <div className="bg-gray-50 border border-border rounded-xl p-6">
                <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5 text-[#1E3A5F]" />
                </div>
                <h3 className="font-bold text-primary text-base mb-2">Milestone Payment Protection</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Your payments are held and only released when you confirm delivery meets the agreed specification. You never pay for work that does not meet the brief.</p>
              </div>

              <div className="bg-gray-50 border border-border rounded-xl p-6">
                <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-[#1E3A5F]" />
                </div>
                <h3 className="font-bold text-primary text-base mb-2">Direct Oversight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Every project above $2,000 receives a dedicated Veritas project supervisor who monitors delivery, reviews milestones, and steps in personally if anything falls behind.</p>
              </div>
            </div>

            <p className="text-center text-primary font-semibold mt-8 text-lg">
              No cash at risk. No geographic uncertainty. No excuses.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">From the Professionals We Serve</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Oluwaseun A.", text: "The Trust Passport removed the bias I previously faced. I am now contracting directly with US enterprise teams." },
                { name: "Fatima R.", text: "Finally, a platform that feels like institutional infrastructure rather than a gig marketplace. The verification process is rigorous but worth it." },
                { name: "Miguel S.", text: "Veritas acts as my legal anchor in the US, allowing me to focus entirely on engineering delivery rather than cross-border compliance." }
              ].map((t, i) => (
                <Card key={i}>
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />)}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">"{t.text}"</p>
                    <div>
                      <div className="font-bold text-primary">{t.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">Verified Professional</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — Launch */}
        <section className="bg-[#1E3A5F] text-white py-24">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Shield className="w-12 h-12 text-[#C9A84C] mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Institutional Grade. Verified Excellence.</h2>
            <p className="text-lg text-white/80 mb-10">
              Register today to access the infrastructure trusted by enterprise procurement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?tab=register&role=client">
                <Button size="lg" className="h-12 px-8 bg-[#C9A84C] text-[#1E3A5F] hover:bg-[#C9A84C]/90 font-semibold">
                  Hire Verified Talent
                </Button>
              </Link>
              <Link href="/auth?tab=register&role=professional">
                <Button size="lg" variant="outline" className="h-12 px-8 border-white/40 text-white hover:bg-white/10">
                  Build Your Passport
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-white/50 text-sm">
              Questions or reports? Contact us at{" "}
              <a href="mailto:masmat170290@gmail.com" className="text-[#C9A84C] hover:underline">
                masmat170290@gmail.com
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
