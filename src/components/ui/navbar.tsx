"use client";

import * as React from "react";
import Link from "next/link";
import { Compass, X, ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/lib/content-context";
import { DEFAULT_PAGES_DATA } from "@/lib/default-pages-data";

export function Navbar() {
  const { data } = useSiteContent();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isPagesOpen, setIsPagesOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const brandName = data?.brand?.name || "AETHER";
  const ctaText = data?.brand?.navCtaText || "Let's Talk";

  const allPages = React.useMemo(() => {
    if (!data?.customPages) return [];
    return Object.values(data.customPages).filter((p) => p.isPublished !== false);
  }, [data?.customPages]);

  return (
    <>
      <header
        id="navbar-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-4 bg-background/70 backdrop-blur-md border-b border-white/5"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Logo Link */}
          <Link
            href="/"
            className="text-sm font-extrabold tracking-widest text-white uppercase hover:opacity-80 transition-opacity"
          >
            {brandName}
          </Link>

          {/* Desktop Links */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("work")}
              id="nav-link-work"
              className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
            >
              Work
            </button>
            <button
              onClick={() => scrollToSection("process")}
              id="nav-link-process"
              className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
            >
              Process
            </button>
            <button
              onClick={() => scrollToSection("philosophy")}
              id="nav-link-philosophy"
              className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
            >
              Philosophy
            </button>
            {/* Custom Pages Directory Drawer Button - Only shown when user has created/published pages */}
            {allPages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsPagesOpen(true)}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Pages ({allPages.length})</span>
              </button>
            )}
            <button
              onClick={() => scrollToSection("contact")}
              id="nav-link-contact"
              className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* CTA & Mobile Pages Button */}
          <div className="flex items-center gap-3">
            {allPages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsPagesOpen(true)}
                className="md:hidden flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>Pages ({allPages.length})</span>
              </button>
            )}

            <button
              onClick={() => scrollToSection("contact")}
              id="nav-cta-button"
              className="relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest overflow-hidden transition-all duration-300 border border-white text-white hover:bg-white hover:text-black cursor-pointer"
            >
              {ctaText}
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN PAGES DIRECTORY DRAWER */}
      {isPagesOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col p-6 sm:p-12 overflow-y-auto animate-fade-in">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">
                  Site Architecture
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Studio Pages &amp; Subpages ({allPages.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPagesOpen(false)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
              {allPages.map((p) => (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}`}
                  onClick={() => setIsPagesOpen(false)}
                  className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 group-hover:text-blue-400 transition-colors">
                      {p.category}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-white">
                      {p.title}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2 mt-1">
                      {p.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>All 20 subpages are live and customizable via &ldquo;/admin&rdquo;.</span>
              <Link
                href="/admin"
                onClick={() => setIsPagesOpen(false)}
                className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
              >
                Admin Control Center &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
