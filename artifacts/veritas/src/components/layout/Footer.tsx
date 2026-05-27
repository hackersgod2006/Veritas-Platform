import { Shield } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#1E3A5F] text-white py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white mb-4">
              <Shield className="w-6 h-6 text-[#C9A84C]" />
              <span className="font-bold text-lg tracking-tight">VERITAS</span>
            </Link>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              The legal, financial, and verification bridge between world-class global professionals and enterprise clients.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/auth?tab=register&role=professional" className="hover:text-white transition-colors">Apply for Passport</Link></li>
              <li><Link href="/auth?tab=register&role=client" className="hover:text-white transition-colors">Hire Verified Talent</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Client Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact & Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="mailto:masmat170290@gmail.com" className="hover:text-white transition-colors">
                  masmat170290@gmail.com
                </a>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-sm text-white/40 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© 2026 Veritas Infrastructure Systems, Inc.</p>
          <p>Delaware C-Corp — USA</p>
        </div>
      </div>
    </footer>
  );
}
