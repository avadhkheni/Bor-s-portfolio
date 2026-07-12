"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/ui/navbar";
import { GooeyText } from "@/components/ui/gooey-text";
import { ProjectCard } from "@/components/ui/project-card";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { ContainerScroll } from "@/components/ui/container-scroll";
import { ProcessSection } from "@/components/ui/process-section";
import { Preloader } from "@/components/ui/preloader";
import { ContactForm } from "@/components/ui/contact-form";
import { TextRevealByWord } from "@/components/ui/text-reveal";
import { ArrowDown, ArrowUpRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const featuredProjects = [
  {
    id: "aether",
    title: "AETHER — Minimal Skincare Identity",
    category: "Packaging & Brand Identity",
    year: "2026",
    imageColor: "from-zinc-800 to-zinc-950"
  },
  {
    id: "vortex",
    title: "VORTEX — Kinetic FinTech Platform",
    category: "Digital Branding & UI System",
    year: "2025",
    imageColor: "from-zinc-900 to-zinc-950"
  },
  {
    id: "nova",
    title: "NOVA — Cyber Beverage Campaign",
    category: "3D Art & Package Design",
    year: "2025",
    imageColor: "from-zinc-800 to-zinc-900"
  },
  {
    id: "helios",
    title: "HELIOS — Eco Hospitality Branding",
    category: "Creative Direction & Print",
    year: "2024",
    imageColor: "from-zinc-900 to-black"
  }
];

const parallaxImages = [
  { src: "/images/best-work.png", alt: "Best Work - Minimalist Skincare Identity" },
  { src: "/images/project-1.png", alt: "Stationery Design" },
  { src: "/images/project-2.png", alt: "Box Packaging" },
  { src: "/images/project-3.png", alt: "Logo Detailing Detail" },
  { src: "/images/project-1.png", alt: "Stationery Visual" },
  { src: "/images/project-2.png", alt: "Packaging Box Visual" },
  { src: "/images/project-3.png", alt: "Logo Debossing Detail" }
];

export default function Home() {
  const heroRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Hero content entrance animations (starts right as preloader leaves)
      gsap.fromTo(
        ".hero-fade-in",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.4, ease: "power4.out", stagger: 0.15, delay: 0.1 }
      );
    });

    return () => ctx.revert();
  }, [isLoading]);

  const scrollToWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

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
          <div className="hero-fade-in h-28 md:h-36 flex items-center justify-center w-full relative">
            <GooeyText
              texts={["IDENTITY", "PACKAGING", "STRATEGY", "AESTHETICS", "TYPOGRAPHY"]}
              morphTime={1.2}
              cooldownTime={0.4}
              textClassName="font-extrabold tracking-tighter text-white text-5xl sm:text-7xl md:text-8xl"
            />
          </div>
        </div>
      </section>

      {/* Zoom Parallax Showcase */}
      <ZoomParallax images={parallaxImages} />

      {/* Breathable Spacer Section */}
      <div className="py-24 md:py-36 bg-black flex items-center justify-center border-t border-white/20">
        <div className="max-w-3xl mx-auto text-center px-6 select-none">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/30 block mb-3">02 / BRAND EXPANSION</span>
          <div className="h-[1px] w-12 bg-white/20 mx-auto"></div>
        </div>
      </div>

      {/* 3D Scroll Showcase Section (Third Section) */}
      <section className="bg-black py-12 md:py-20 border-t border-white/20 relative overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="text-center max-w-4xl mx-auto flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/30 block mb-4">
                02 / BRAND EXPANSION
              </span>
              <h2 className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter uppercase leading-none">
                KINETIC IDENTITY
              </h2>
            </div>
          }
        >
          <div className="relative h-full w-full">
            <img
              src="/images/expand-showcase.png"
              alt="Kinetic Identity Showcase"
              className="w-full h-full object-cover"
            />
          </div>
        </ContainerScroll>

        {/* Visual Architecture Text Details */}
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-left">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50 block mb-6">
            Visual Architecture
          </span>
          <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-8 leading-tight">
            Forging design systems through <br />
            uncompromising form & layout.
          </h3>
          <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
            Every concept we construct is engineered to command attention. We eliminate visual noise to let the pure form of the logomark, typography, and packaging speak directly to the viewer. This is visual structure at its peak.
          </p>
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section
        id="work"
        className="py-24 md:py-32 px-6 md:px-12 border-t border-white/20 bg-background relative"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-white">
                Selected Work
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Case studies in <br />
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  visual distinction
                </span>
              </h2>
            </div>
            <p className="mt-4 md:mt-0 text-white/70 max-w-xs leading-relaxed text-sm">
              We design cohesive identities that speak clearly across physical packaging and interactive screen interfaces.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                category={project.category}
                year={project.year}
                imageColor={project.imageColor}
              />
            ))}
          </div>
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
