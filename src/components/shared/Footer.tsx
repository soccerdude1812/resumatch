import { FileText, Shield } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-text-primary tracking-tight">
                Resu<span className="text-gradient">Match</span>
              </span>
            </Link>
            <p className="text-xs text-text-tertiary">
              AI-powered resume tailoring
            </p>
          </div>

          {/* Privacy notice */}
          <div className="flex items-start gap-3 max-w-md glass rounded-xl p-4">
            <Shield className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              Your resume is processed by AI and is not stored. We do not save
              or share your personal information. All processing happens in
              real-time and data is discarded after your session.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--glass-border)] text-center">
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} ResuMatch. Built with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
