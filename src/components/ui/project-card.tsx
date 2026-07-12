"use client";

import * as React from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  year: string;
  imageColor: string; // fallback color styling
  imageUrl?: string; // actual generated image if present
}

export function ProjectCard({
  id,
  title,
  category,
  year,
  imageColor,
  imageUrl
}: ProjectCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);
  const imageContainerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within the element
    const y = e.clientY - rect.top;  // y coordinate within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 12; // tilt angle
    const rotateY = (x - centerX) / 12;  // tilt angle

    // GSAP animate card rotation
    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 800,
      ease: "power2.out",
      duration: 0.4
    });

    // Move the radial glow follow cursor
    gsap.to(glow, {
      left: x,
      top: y,
      opacity: 0.15,
      scale: 1,
      ease: "power2.out",
      duration: 0.2
    });
    
    // Slight shift of image inside for parallax depth
    if (imageContainerRef.current) {
      gsap.to(imageContainerRef.current, {
        x: (x - centerX) / 25,
        y: (y - centerY) / 25,
        ease: "power2.out",
        duration: 0.4
      });
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    // Reset card position
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
      duration: 0.6
    });

    // Fade out glow
    gsap.to(glow, {
      opacity: 0,
      scale: 0.8,
      ease: "power3.out",
      duration: 0.6
    });

    // Reset parallax
    if (imageContainerRef.current) {
      gsap.to(imageContainerRef.current, {
        x: 0,
        y: 0,
        ease: "power3.out",
        duration: 0.6
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id={`project-card-${id}`}
      className="group relative flex flex-col rounded-3xl border border-white/20 bg-white/[0.02] p-5 cursor-pointer select-none transition-all duration-500 hover:border-white hover:bg-white/[0.03]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-300"
        style={{
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          opacity: 0,
          transform: "translate3d(-50%, -50%, 0px)"
        }}
      />

      {/* Visual Image Container */}
      <div
        className="relative h-64 md:h-80 w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/20"
        style={{ transform: "translateZ(30px)" }}
      >
        <div
          ref={imageContainerRef}
          className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-105"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${imageColor} opacity-20`}
            />
          )}

          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Abstract vector shape representing identity */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
            <svg
              className="w-24 h-24 text-white font-light stroke-[0.5]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
            </svg>
          </div>
        </div>

        {/* Date tag */}
        <span className="absolute top-4 left-4 z-10 rounded-full bg-black/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-sm border border-white/20">
          {year}
        </span>
      </div>

      {/* Text Info */}
      <div className="mt-6 flex items-start justify-between" style={{ transform: "translateZ(45px)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            {category}
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
            {title}
          </h3>
        </div>
        
        {/* Floating action arrow */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.02] text-white transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
