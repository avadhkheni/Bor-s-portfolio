"use client";

import * as React from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Navbar } from "@/components/ui/navbar";
import { GooeyText } from "@/components/ui/gooey-text";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { ProcessSection } from "@/components/ui/process-section";
import { Preloader } from "@/components/ui/preloader";
import { ContactForm } from "@/components/ui/contact-form";
import { TextRevealByWord } from "@/components/ui/text-reveal";
import Link from "next/link";
import { MovingShowcase } from "@/components/ui/moving-showcase";
import { DynamicCustomSectionsList } from "@/components/ui/dynamic-custom-sections";
import { ArrowDown, Compass, ArrowUpRight } from "lucide-react";
import { DEFAULT_PAGES_DATA } from "@/lib/default-pages-data";

import { useSiteContent } from "@/lib/content-context";
import Lenis from "lenis";

export default function Home() {
  const { data } = useSiteContent();
  const heroRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const lenis = new Lenis();

    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleScroll);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    let ctx: gsap.Context | null = null;
    let refreshTimer: NodeJS.Timeout | null = null;

    if (!isLoading) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".hero-fade-in",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.4, ease: "power4.out", stagger: 0.15, delay: 0.1 }
        );
      });

      // Refresh ScrollTrigger after DOM layout stabilizes post-preloader
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      ctx?.revert();
      gsap.ticker.remove(updateTicker);
      lenis.off("scroll", handleScroll);
      lenis.destroy();
    };
  }, [isLoading]);

  const handlePreloaderComplete = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} />
      <div className={`flex-1 flex flex-col bg-background font-sans radial-grid transition-opacity duration-1000 ${isLoading ? "opacity-0" : "opacity-100"}`}>
        <Navbar />

        {/* Hero Section */}
        <section
          ref={heroRef}
          id="hero"
          className="relative min-h-screen flex flex-col justify-center items-center py-20 px-6 md:px-12 overflow-hidden bg-black"
        >
          {/* Large abstract neon blur background */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-5xl rounded-full bg-gradient-to-tr from-white/5 to-white/0 blur-[120px] opacity-60" />

          <div className="text-center relative z-10 max-w-5xl mx-auto flex flex-col items-center justify-center w-full">
            {/* Morphing Gooey Text Component */}
            <div className="hero-fade-in h-32 sm:h-44 md:h-56 flex items-center justify-center w-full relative">
              <GooeyText
                texts={data?.hero?.words || ["IDENTITY", "PACKAGING", "STRATEGY", "AESTHETICS", "TYPOGRAPHY"]}
                morphTime={data?.hero?.morphTime || 1.2}
                cooldownTime={data?.hero?.cooldownTime || 0.4}
                textClassName="font-extrabold tracking-tighter text-white text-4xl sm:text-7xl md:text-9xl"
              />
            </div>
          </div>
        </section>

        {/* Zoom Parallax Showcase */}
        <ZoomParallax images={data?.parallaxImages} />

        {/* Moving Showcase Rows */}
        <MovingShowcase />

        {/* Philosophy Section */}
        <section
          id="philosophy"
          className="relative bg-black border-t border-white/20"
        >
          <div className="pointer-events-none absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-white/[0.02] blur-[120px]" />
          
          <TextRevealByWord 
            text={data?.philosophy?.quote || '"A brand is no longer what we tell the consumer it is — it is **what** **consumers** **tell** **each** **other** it is. We build the visual frameworks that command that conversation."'} 
          />
        </section>

        {/* Methodology Section */}
        <ProcessSection />

        {/* Dynamic Custom Sections (Configured via Admin Panel) */}
        <DynamicCustomSectionsList sections={data?.customSections} />

        {/* Explore All Studio Subpages Section - Only shown when user has published custom pages */}
        {(() => {
          const publishedPages = Object.values(data?.customPages || {}).filter((p) => p.isPublished !== false);
          if (publishedPages.length === 0) return null;
          return (
            <section id="pages-directory" className="py-24 px-6 md:px-12 bg-black border-t border-white/10 relative overflow-hidden">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/70 mb-4">
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      <span>Site Architecture</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                      Explore Studio Pages
                    </h2>
                    <p className="mt-3 text-base text-white/60 max-w-xl">
                      Deep-dive into our capabilities, design research labs, essays, pricing tiers, and client knowledgebase.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-white/40">
                    {publishedPages.length} Active Subpage{publishedPages.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {publishedPages.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/p/${p.slug}`}
                      className="group p-5 rounded-2xl bg-[#0e0f18] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 group-hover:text-blue-400 transition-colors">
                          {p.category}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                          {p.title}
                        </h3>
                        <p className="text-[11px] text-white/50 line-clamp-2 mt-1">
                          {p.subtitle}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Contact Section */}
        <ContactForm />
      </div>
    </>
  );
}
