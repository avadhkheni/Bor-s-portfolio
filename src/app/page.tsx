"use client";

import * as React from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Navbar } from "@/components/ui/navbar";
import { GooeyText } from "@/components/ui/gooey-text";
import { ProjectCardStack } from "@/components/ui/card-stack";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { ProcessSection } from "@/components/ui/process-section";
import { Preloader } from "@/components/ui/preloader";
import { ContactForm } from "@/components/ui/contact-form";
import { TextRevealByWord } from "@/components/ui/text-reveal";
import { ArrowDown } from "lucide-react";

import Lenis from "lenis";

const parallaxImages = [
  {
    src: "/images2/1.jpg",
    alt: "Brand identity design showcase",
  },
  {
    src: "/images2/2.jpg",
    alt: "Minimalist packaging aesthetic",
  },
  {
    src: "/images2/3.jpg",
    alt: "High-end product photography",
  },
  {
    src: "/images2/4.jpg",
    alt: "Creative directional brand art",
  },
  {
    src: "/images2/5.jpg",
    alt: "Custom typography and layout",
  },
  {
    src: "/images2/6.jpg",
    alt: "Spatial audio identity mockup",
  },
  {
    src: "/images2/7.jpg",
    alt: "Cyber beverage package composition",
  },
];

const featuredProjects = [
  {
    id: "aether",
    title: "AETHER — Minimal Skincare Identity",
    category: "Packaging & Brand Identity",
    year: "2026",
    imageColor: "from-zinc-800 to-zinc-950",
    imageSrc: "/images2/8.jpg"
  },
  {
    id: "vortex",
    title: "VORTEX — Kinetic FinTech Platform",
    category: "Digital Branding & UI System",
    year: "2025",
    imageColor: "from-zinc-900 to-zinc-950",
    imageSrc: "/images2/9.jpg"
  },
  {
    id: "nova",
    title: "NOVA — Cyber Beverage Campaign",
    category: "3D Art & Package Design",
    year: "2025",
    imageColor: "from-zinc-800 to-zinc-900",
    imageSrc: "/images2/10.jpg"
  },
  {
    id: "helios",
    title: "HELIOS — Eco Hospitality Branding",
    category: "Creative Direction & Print",
    year: "2024",
    imageColor: "from-zinc-900 to-black",
    imageSrc: "/images2/11.jpg"
  },
  {
    id: "kinetic",
    title: "KINETIC — Spatial Audio Identity",
    category: "Hardware & Sound Branding",
    year: "2024",
    imageColor: "from-slate-900 to-zinc-950",
    imageSrc: "/images2/12.jpg"
  },
  {
    id: "aurora",
    title: "AURORA — Luxury Chrono Timepieces",
    category: "Watchmaking & Industrial",
    year: "2024",
    imageColor: "from-stone-900 to-zinc-950",
    imageSrc: "/images2/13.jpg"
  },
  {
    id: "solaris",
    title: "SOLARIS — Sustainable Architecture",
    category: "Environmental Branding",
    year: "2023",
    imageColor: "from-neutral-900 to-black",
    imageSrc: "/images2/14.jpg"
  },
  {
    id: "nebula",
    title: "NEBULA — High-Performance Apparel",
    category: "Textile & Product Identity",
    year: "2023",
    imageColor: "from-zinc-900 to-neutral-950",
    imageSrc: "/images2/15.jpg"
  }
];

export default function Home() {
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

  return (
    <>
      <Preloader onComplete={() => setIsLoading(false)} />
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

          <div className="text-center relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
            {/* Morphing Gooey Text Component */}
            <div className="hero-fade-in h-24 sm:h-28 md:h-36 flex items-center justify-center w-full relative">
              <GooeyText
                texts={["IDENTITY", "PACKAGING", "STRATEGY", "AESTHETICS", "TYPOGRAPHY"]}
                morphTime={1.2}
                cooldownTime={0.4}
                textClassName="font-extrabold tracking-tighter text-white text-3xl sm:text-7xl md:text-8xl"
              />
            </div>
          </div>
        </section>

        {/* Zoom Parallax Showcase */}
        <ZoomParallax images={parallaxImages} />

      {/* Featured Projects Showcase */}
      <section
        id="work"
        className="py-24 md:py-32 px-6 md:px-12 border-t border-white/20 bg-background relative"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-red-600 rounded-full inline-block" />
                <span className="text-xs font-semibold uppercase tracking-widest text-white">
                  Selected Work
                </span>
              </div>
              <h2 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-neutral-300 leading-tight">
                Proven results, <br />
                <span className="text-neutral-400">stunning designs</span>
              </h2>
            </div>
            <p className="mt-4 md:mt-0 text-white/70 max-w-xs leading-relaxed text-sm">
              We design cohesive identities that speak clearly across physical packaging and interactive screen interfaces.
            </p>
          </div>

          {/* Card Stack Fan */}
          <ProjectCardStack
            items={featuredProjects}
            cardWidth={520}
            cardHeight={340}
            spreadPx={190}
            spreadDeg={9}
            depthPx={80}
            tiltXDeg={9}
            activeLiftPx={30}
            activeScale={1.04}
            inactiveScale={0.91}
            springStiffness={290}
            springDamping={28}
            maxVisible={7}
            autoAdvance
            intervalMs={2800}
            pauseOnHover
            loop
            showDots
          />
        </div>
      </section>

      {/* Philosophy Section */}
      <section
        id="philosophy"
        className="relative bg-black border-t border-white/20"
      >
        <div className="pointer-events-none absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-white/[0.02] blur-[120px]" />
        
        <TextRevealByWord 
          text='"A brand is no longer what we tell the consumer it is — it is **what** **consumers** **tell** **each** **other** it is. We build the visual frameworks that command that conversation."' 
        />
      </section>

      {/* Methodology Section */}
      <ProcessSection />

      {/* Contact Section */}
      <ContactForm />
      </div>
    </>
  );
}
