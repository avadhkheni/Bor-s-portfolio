"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { useSiteContent } from "@/lib/content-context";

interface ShowcaseItem {
  id: string;
  title: string;
  url: string;
  imageSrc: string;
  tag?: string;
}

function BrowserCard({ item }: { item: ShowcaseItem }) {
  return (
    <Link
      href={`/project/${item.id}`}
      className="group relative flex-shrink-0 w-[320px] sm:w-[380px] md:w-[440px] rounded-2xl overflow-hidden border border-white/15 bg-[#0e0e12] shadow-2xl transition-all duration-500 hover:border-white/40 hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1.5 block cursor-pointer"
    >
      {/* Screenshot / Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
        <img
          src={item.imageSrc}
          alt={item.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Top-left glassmorphic category tag */}
        {item.tag && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-widest text-white/90 shadow-md">
              {item.tag}
            </span>
          </div>
        )}

        {/* Deep gradient vignette for clear text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between z-10">
          <div className="flex flex-col gap-1 max-w-[78%]">
            <span className="text-[11px] font-mono text-white/60 tracking-wide truncate">
              {item.url}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug truncate group-hover:text-white transition-colors">
              {item.title}
            </h3>
          </div>

          {/* Premium circular arrow button */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:scale-110 ml-3">
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MovingShowcase() {
  const { data } = useSiteContent();

  const row1 = data?.showcase?.row1 || [];
  const row2 = data?.showcase?.row2 || [];

  // Multiply arrays to ensure seamless infinite looping with zero gap
  const row1Triple = React.useMemo(() => {
    if (!row1.length) return [];
    if (row1.length < 3) return [...row1, ...row1, ...row1, ...row1, ...row1, ...row1];
    return [...row1, ...row1, ...row1];
  }, [row1]);

  const row2Triple = React.useMemo(() => {
    if (!row2.length) return [];
    if (row2.length < 3) return [...row2, ...row2, ...row2, ...row2, ...row2, ...row2];
    return [...row2, ...row2, ...row2];
  }, [row2]);

  return (
    <section id="work" className="py-20 md:py-28 bg-black border-t border-white/10 relative overflow-hidden">
      {/* Glow background effects */}
      <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-[35vw] h-[35vw] rounded-full bg-purple-500/5 blur-[140px]" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-blue-500 rounded-full inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
              {data?.showcase?.headerBadge || "Interactive Web Showcase"}
            </span>
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {data?.showcase?.headerTitle || "Live Web & Brand Systems"}
          </h2>
        </div>
        <p className="mt-3 md:mt-0 text-white/60 max-w-sm text-sm leading-relaxed">
          {data?.showcase?.headerSubtitle ||
            "Continuously moving interface previews built with precision typography, responsive geometry, and smooth interactions."}
        </p>
      </div>

      {/* Marquee Rows Container */}
      <div className="flex flex-col gap-6 md:gap-8 w-full overflow-hidden select-none">
        
        {/* ROW 1: Moves LEFT continuously */}
        {row1Triple.length > 0 && (
          <div className="relative w-full overflow-hidden group/row1">
            {/* Side Gradients for seamless edge blending */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10" />

            <motion.div
              className="flex gap-5 md:gap-6 w-max"
              animate={{ x: ["0%", "-33.333%"] }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 35,
                ease: "linear",
              }}
            >
              {row1Triple.map((item, idx) => (
                <BrowserCard key={`r1-${item.id}-${idx}`} item={item} />
              ))}
            </motion.div>
          </div>
        )}

        {/* ROW 2: Moves RIGHT continuously (opposite direction) */}
        {row2Triple.length > 0 && (
          <div className="relative w-full overflow-hidden group/row2">
            {/* Side Gradients */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10" />

            <motion.div
              className="flex gap-5 md:gap-6 w-max"
              animate={{ x: ["-33.333%", "0%"] }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 35,
                ease: "linear",
              }}
            >
              {row2Triple.map((item, idx) => (
                <BrowserCard key={`r2-${item.id}-${idx}`} item={item} />
              ))}
            </motion.div>
          </div>
        )}

      </div>
    </section>
  );
}
