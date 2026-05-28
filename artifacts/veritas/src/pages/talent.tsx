import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Shield, Star, CheckCircle, Briefcase, Filter, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

const TIER_COLORS: Record<string, string> = {
  "Tier 1": "bg-amber-100 text-amber-800 border-amber-200",
  "Tier 2": "bg-slate-100 text-slate-700 border-slate-200",
  "Tier 3": "bg-blue-50 text-blue-700 border-blue-200",
};

const SKILL_CATEGORIES = [
  "Engineering & Technology",
  "Finance & Accounting",
  "Legal & Compliance",
  "Healthcare & Medicine",
  "Architecture & Design",
  "Project Management",
  "Data & Analytics",
  "Cybersecurity",
  "Other",
];

interface Professional {
  passportId: string;
  displayName: string;
  skillsCategory: string | null;
  tier: string | null;
  trustScore: number | null;
  projectsCompleted: number | null;
  deliveryRate: number | null;
  clientSatisfaction: number | null;
}

function ProfessionalCard({ pro }: { pro: Professional }) {
  const tier = pro.tier || "Tier 3";
  const score = pro.trustScore ?? 0;

  return (
    <div className="bg-white border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg">
          {pro.displayName.charAt(0)}
        </div>
        <Badge variant="outline" className={`text-xs font-semibold ${TIER_COLORS[tier] ?? TIER_COLORS["Tier 3"]}`}>
          {tier}
        </Badge>
      </div>

      <h3 className="font-bold text-primary text-lg mb-1">{pro.displayName}</h3>
      {pro.skillsCategory && (
        <p className="text-sm text-muted-foreground mb-4">{pro.skillsCategory}</p>
      )}

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-secondary rounded-full h-2">
          <div
            className="bg-[#C9A84C] h-2 rounded-full transition-all"
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <span className="text-sm font-bold text-primary">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5 text-center">
        <div className="bg-secondary rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Projects</p>
          <p className="font-bold text-primary text-sm">{pro.projectsCompleted ?? 0}</p>
        </div>
        <div className="bg-secondary rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Delivery</p>
          <p className="font-bold text-primary text-sm">
            {pro.deliveryRate != null ? `${pro.deliveryRate}%` : "—"}
          </p>
        </div>
        <div className="bg-secondary rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Rating</p>
          <p className="font-bold text-primary text-sm">
            {pro.clientSatisfaction != null ? `${pro.clientSatisfaction}%` : "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        <span className="text-xs text-muted-foreground">Identity & background verified</span>
      </div>

      <Link href={`/passport/${pro.passportId}`}>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm group-hover:shadow-sm transition-all">
          View Trust Passport
        </Button>
      </Link>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-primary/40" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">
        {filtered ? "No professionals match your filters" : "No verified professionals yet"}
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        {filtered
          ? "Try adjusting your filters to see more results."
          : "Verified professionals will appear here once their Trust Passport applications are approved."}
      </p>
      {filtered && (
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

export default function TalentDirectoryPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (tierFilter !== "all") params.set("tier", tierFilter);
    if (categoryFilter !== "all") params.set("skillsCategory", categoryFilter);

    fetch(`${apiBase}/api/professionals/directory?${params}`)
      .then(r => r.json())
      .then(data => {
        setProfessionals(data.professionals ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {
        setProfessionals([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, tierFilter, categoryFilter]);

  const filtered = professionals.filter(p =>
    !search || p.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (p.skillsCategory ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const isFiltered = tierFilter !== "all" || categoryFilter !== "all" || !!search;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-[#C9A84C]" />
            <span className="text-[#C9A84C] font-semibold uppercase tracking-widest text-sm">Verified Talent</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            The Global Talent Directory
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Every professional listed here has passed Veritas' institutional verification process —
            identity, credentials, background, and integrity checks all confirmed.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-300">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Identity Verified</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Skills Assessed</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Background Cleared</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-white sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or skill..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={tierFilter} onValueChange={v => { setTierFilter(v); setPage(1); }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Tier 1">Tier 1</SelectItem>
                  <SelectItem value="Tier 2">Tier 2</SelectItem>
                  <SelectItem value="Tier 3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {SKILL_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFiltered && (
                <Button variant="ghost" size="sm" onClick={() => { setTierFilter("all"); setCategoryFilter("all"); setSearch(""); setPage(1); }}>
                  Clear
                </Button>
              )}
            </div>
            <span className="text-sm text-muted-foreground ml-auto hidden sm:block">
              {loading ? "Loading…" : `${total} verified professional${total !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-2 bg-gray-100 rounded w-full mb-6" />
                <div className="h-9 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.length === 0
                ? <EmptyState filtered={isFiltered} />
                : filtered.map(pro => <ProfessionalCard key={pro.passportId} pro={pro} />)
              }
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-[#0A1628] text-white py-14 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to hire verified talent?</h2>
          <p className="text-blue-200 mb-6 max-w-lg mx-auto">
            Create a free client account and get matched with verified professionals today.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth?tab=register">
              <Button className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0A1628] font-bold px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
