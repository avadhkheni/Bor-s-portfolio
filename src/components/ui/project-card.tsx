"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  year: string;
  imageColor: string;
  imageUrl?: string;
  href?: string;
  index?: number;
}

// Wireframe globe SVG matching the image reference
function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      className="w-full h-full"
    >
      {/* Outer circle */}
      <circle cx="60" cy="60" r="46" />

      {/* Vertical meridians */}
      <ellipse cx="60" cy="60" rx="18" ry="46" />
      <ellipse cx="60" cy="60" rx="34" ry="46" />

      {/* Horizontal parallels */}
      <ellipse cx="60" cy="60" rx="46" ry="12" />
      <ellipse cx="60" cy="60" rx="46" ry="26" />

      {/* Equator */}
      <line x1="14" y1="60" x2="106" y2="60" />
      {/* Prime meridian */}
      <line x1="60" y1="14" x2="60" y2="106" />
    </svg>
  );
}

export function ProjectCard({
  id,
  title,
  category,
  year,
  imageColor,
  imageUrl,
  href,
  index = 0,
}: ProjectCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);
  const globeRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Scroll entrance animation
  React.useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: index * 0.12,
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }, card);

    return () => ctx.revert();
  }, [index]);

  // 3D tilt + cursor glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const globe = globeRef.current;
    if (!card || !glow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rotX = -((y - cy) / cy) * 6;
    const rotY = ((x - cx) / cx) * 6;

    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      transformPerspective: 900,
      ease: "power2.out",
      duration: 0.35,
    });

    gsap.to(glow, {
      left: x,
      top: y,
      opacity: 1,
      ease: "power2.out",
      duration: 0.2,
    });

    // Subtle globe parallax
    if (globe) {
      gsap.to(globe, {
        x: (x - cx) / 20,
        y: (y - cy) / 20,
        ease: "power2.out",
        duration: 0.4,
      });
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const globe = globeRef.current;
    if (!card || !glow) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
      duration: 0.7,
    });

    gsap.to(glow, {
      opacity: 0,
      ease: "power3.out",
      duration: 0.5,
    });

    if (globe) {
      gsap.to(globe, {
        x: 0,
        y: 0,
        ease: "power3.out",
        duration: 0.6,
      });
    }
  };

  const handleMouseEnter = () => {
    const globe = globeRef.current;
    const content = contentRef.current;
    if (globe) {
      gsap.to(globe, { opacity: 0.55, scale: 1.05, duration: 0.4, ease: "power2.out" });
    }
    if (content) {
      gsap.to(content, { y: -4, duration: 0.35, ease: "power2.out" });
    }
  };

  const handleMouseLeaveExtra = () => {
    const globe = globeRef.current;
    const content = contentRef.current;
    if (globe) {
      gsap.to(globe, { opacity: 0.35, scale: 1, duration: 0.5, ease: "power3.out" });
    }
    if (content) {
      gsap.to(content, { y: 0, duration: 0.4, ease: "power3.out" });
    }
  };

  const Tag = href ? "a" : "div";

  return (
    <Tag
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      ref={cardRef as any}
      id={`project-card-${id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        handleMouseLeave();
        handleMouseLeaveExtra();
      }}
      onMouseEnter={handleMouseEnter}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] cursor-pointer select-none"
      style={{
        transformStyle: "preserve-3d",
        aspectRatio: "4/3",
      }}
    >
      {/* Cursor-following radial glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)",
          opacity: 0,
          zIndex: 2,
        }}
      />

      {/* Background gradient wash */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${imageColor} opacity-30`}
        style={{ zIndex: 0 }}
      />

      {/* Optional real image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          draggable={false}
          style={{ zIndex: 0 }}
        />
      )}

      {/* Globe icon — centered */}
      <div
        ref={globeRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0.35, zIndex: 1 }}
      >
        <div className="w-28 h-28 text-white/70">
          <GlobeIcon />
        </div>
      </div>

      {/* Top-left year badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
          {year}
        </span>
      </div>

      {/* Bottom content: category + title + arrow */}
      <div
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between p-5"
      >
        <div className="flex flex-col gap-0.5 max-w-[80%]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 leading-none mb-1">
            {category}
          </p>
          <h3 className="text-[15px] md:text-[17px] font-bold tracking-tight text-white leading-snug">
            {title}
          </h3>
        </div>

        {/* Arrow button */}
        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black ml-4">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* Bottom edge vignette for text readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 35%, transparent 65%)",
          zIndex: 1,
        }}
      />

      {/* Subtle top fade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%)",
          zIndex: 1,
        }}
      />
    </Tag>
  );
}
