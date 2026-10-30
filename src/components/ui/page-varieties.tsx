"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CustomPage, PageLayoutVariant, PageBlock } from "@/lib/site-types";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Terminal,
  Grid,
  Film,
  Layers,
  Cpu,
  Orbit,
  Maximize2,
  Table,
  Eye,
  Sliders,
  Type,
  FileText,
  Volume2,
  Compass,
  CheckCircle2,
  Share2,
} from "lucide-react";

export const VARIETY_OPTIONS: Array<{ id: PageLayoutVariant; name: string; icon: string; desc: string }> = [
  { id: "standard-editorial", name: "Classic Editorial", icon: "📖", desc: "Clean modern typographic narrative" },
  { id: "cinema-horizontal", name: "Cinema Filmstrip Scroll", icon: "🎬", desc: "Horizontal widescreen landscape track" },
  { id: "bento-grid", name: "Bento Box Matrix", icon: "🍱", desc: "Asymmetrical interactive bento tiles" },
  { id: "brutalist-index", name: "Neo-Brutalist Index", icon: "⚡", desc: "Raw stark typography & numbered list" },
  { id: "editorial-lookbook", name: "Haute Lookbook", icon: "✨", desc: "High-fashion luxury magazine spread" },
  { id: "cyber-hud", name: "Cyberpunk HUD Terminal", icon: "🤖", desc: "Sci-fi holographic grid & scanlines" },
  { id: "3d-card-stack", name: "3D Stacked Deck", icon: "🃏", desc: "Interactive overlapping 3D card deck" },
  { id: "radial-orbital", name: "Orbital Galaxy Wheel", icon: "🪐", desc: "Circular rotating project nodes" },
  { id: "split-duel-scroll", name: "Split Duel Scroll", icon: "⚖️", desc: "50/50 opposing vertical columns" },
  { id: "immersive-fullscreen-zoom", name: "Immersive Fullscreen Zoom", icon: "🔭", desc: "Full viewport cinematic canvas" },
  { id: "interactive-matrix-table", name: "Data Matrix Spreadsheet", icon: "📊", desc: "Pro catalog with floating live hover popups" },
  { id: "glassmorphism-studio", name: "Frosted Acrylic Glass", icon: "💎", desc: "Layered glassmorphism with neon refraction" },
  { id: "kinetic-type-river", name: "Kinetic Marquee River", icon: "🌊", desc: "Massive animated typographic tickers" },
  { id: "swiss-modernist", name: "Swiss International Style", icon: "📐", desc: "Strict asymmetric grid & poster tension" },
  { id: "isometric-3d", name: "Isometric 3D Room", icon: "🧊", desc: "Angled 3D spatial perspective showcase" },
  { id: "liquid-distortion", name: "Liquid Ripple Canvas", icon: "💧", desc: "Fluid organic wave distortion on hover" },
  { id: "retro-cli-terminal", name: "Interactive ASCII Terminal", icon: "💻", desc: "Executable hacker command line prompt" },
  { id: "newspaper-broadside", name: "Vintage Broadsheet Print", icon: "📰", desc: "Multi-column historic editorial masthead" },
  { id: "spotlight-darkroom", name: "Spotlight Flashlight Darkroom", icon: "🔦", desc: "Cursor beam revealing hidden art in the dark" },
  { id: "infinite-spatial-board", name: "Spatial Infinite Canvas", icon: "🗺️", desc: "Draggable interactive whiteboard canvas" },
  { id: "3d-carousel-wheel", name: "3D Cylindrical Carousel", icon: "🎡", desc: "Rotating 3D carousel cylinder" },
];

export function PageVarietyRenderer({
  page,
  activeVariant,
}: {
  page: CustomPage;
  activeVariant: PageLayoutVariant;
}) {
  const allItems = React.useMemo(() => {
    const items: Array<{ title: string; subtitle?: string; description?: string; image?: string; tag?: string; value?: string }> = [];
    (page.blocks || []).forEach((b) => {
      if (b.items && b.items.length > 0) {
        items.push(...b.items);
      } else if (b.title) {
        items.push({
          title: b.title,
          subtitle: b.badge,
          description: b.content || b.subtitle,
          image: b.image || page.coverImage,
        });
      }
    });
    return items.length > 0 ? items : [
      { title: page.title, subtitle: page.badge, description: page.subtitle, image: page.coverImage },
    ];
  }, [page]);

  // VARIETY 1: CINEMA HORIZONTAL FILMSTRIP SCROLL
  if (activeVariant === "cinema-horizontal") {
    return (
      <div className="py-12 space-y-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-white/60">
              CINEMA TRACK • HORIZONTAL ROLL
            </span>
          </div>
          <span className="text-xs font-mono text-white/40">Scroll horizontally &rarr;</span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 px-6 md:px-12 snap-x snap-mandatory scrollbar-none">
          {allItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="min-w-[85vw] sm:min-w-[550px] lg:min-w-[700px] aspect-[16/10] bg-[#0c0d15] rounded-3xl border border-white/15 overflow-hidden relative group flex flex-col justify-end p-8 snap-center shrink-0 shadow-2xl"
            >
              <img
                src={getOptimizedImageUrl(item.image || page.coverImage || "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384405/artsavvy/27.jpg", 1000)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-blue-600 text-white font-bold inline-block">
                  REEL #{String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white">{item.title}</h3>
                {item.description && (
                  <p className="text-xs sm:text-sm text-white/80 max-w-xl line-clamp-2">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // VARIETY 2: BENTO GRID MATRIX
  if (activeVariant === "bento-grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6">
        {allItems.map((item, idx) => {
          const isLarge = idx === 0 || idx === 3;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-3xl p-8 bg-[#0d0e17] border border-white/10 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group ${
                isLarge ? "md:col-span-2 md:aspect-[16/9]" : "md:col-span-1"
              }`}
            >
              {item.image && (
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <img src={getOptimizedImageUrl(item.image, 800)} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-blue-400">
                  {item.tag || `BENTO 0${idx + 1}`}
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                {item.description && <p className="text-xs text-white/70 leading-relaxed">{item.description}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // VARIETY 3: NEO-BRUTALIST INDEX
  if (activeVariant === "brutalist-index") {
    return (
      <div className="space-y-0 border-t-2 border-white py-6">
        {allItems.map((item, idx) => (
          <div
            key={idx}
            className="border-b-2 border-white py-8 px-4 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white hover:text-black transition-colors group cursor-pointer"
          >
            <div className="flex items-baseline gap-6">
              <span className="text-2xl md:text-5xl font-mono font-black">
                /{String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <span className="text-xs font-mono uppercase tracking-widest text-white/60 group-hover:text-black/60">
                    {item.subtitle}
                  </span>
                )}
              </div>
            </div>
            {item.description && (
              <p className="text-xs md:text-sm font-mono max-w-md text-white/60 group-hover:text-black/80">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // VARIETY 4: HAUTE LOOKBOOK MAGAZINE
  if (activeVariant === "editorial-lookbook") {
    return (
      <div className="space-y-16 py-6 font-serif">
        {allItems.map((item, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
              idx % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-amber-400">
                PLATE NO. {idx + 1}
              </span>
              <h3 className="text-4xl md:text-6xl font-normal tracking-tight text-white leading-tight italic">
                &ldquo;{item.title}&rdquo;
              </h3>
              <p className="text-sm sm:text-base text-white/70 font-sans font-light leading-relaxed">
                {item.description || "A masterclass in editorial hierarchy, negative space, and typographic cadence."}
              </p>
            </div>
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
              <img
                src={getOptimizedImageUrl(item.image || page.coverImage || "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384406/artsavvy/28.jpg", 1000)}
                alt=""
                className="w-full h-full object-cover filter contrast-110"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // VARIETY 5: CYBERPUNK HUD TERMINAL
  if (activeVariant === "cyber-hud") {
    return (
      <div className="p-6 md:p-10 rounded-3xl bg-[#040508] border-2 border-cyan-500/40 font-mono relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="flex items-center justify-between pb-6 border-b border-cyan-500/30 text-cyan-400 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="font-bold tracking-widest">CYBER_SYS // MATRIX_ONLINE</span>
          </div>
          <span className="text-[10px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            SEC_LEVEL: 04
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {allItems.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-cyan-950/20 border border-cyan-500/20 hover:border-cyan-400 space-y-3 relative group transition-colors"
            >
              <div className="text-[10px] text-cyan-500/60 flex items-center justify-between">
                <span>[NODE_{String(idx + 1).padStart(3, "0")}]</span>
                <span className="text-emerald-400">STATUS: COMPILED</span>
              </div>
              <h4 className="text-xl font-bold text-white tracking-wider uppercase group-hover:text-cyan-300">
                {item.title}
              </h4>
              <p className="text-xs text-cyan-200/70 leading-relaxed font-sans">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VARIETY 6: 3D CARD STACK
  if (activeVariant === "3d-card-stack") {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl space-y-4">
          {allItems.slice(0, 5).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: idx * 10, scale: 1 - idx * 0.04 }}
              className="p-8 rounded-3xl bg-[#11121d] border border-white/20 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-blue-600 px-3 py-1 rounded-full text-white">
                  CARD 0{idx + 1}
                </span>
                <span className="text-xs text-white/50">{item.tag || "Interactive"}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{item.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // VARIETY 7: DATA MATRIX TABLE / SPREADSHEET
  if (activeVariant === "interactive-matrix-table") {
    return (
      <div className="rounded-3xl bg-[#0e0f18] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">System Data Matrix</h3>
          </div>
          <span className="text-xs font-mono text-white/40">{allItems.length} Records</span>
        </div>
        <div className="divide-y divide-white/10 font-mono text-xs">
          {allItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-600/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-white/30 w-8">#{String(idx + 1).padStart(2, "0")}</span>
                <span className="font-bold text-white text-sm font-sans">{item.title}</span>
              </div>
              <div className="text-white/60 font-sans text-xs max-w-md truncate">{item.description}</div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-white/5 text-white/60 shrink-0">
                {item.tag || "Verified"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VARIETY 8: RETRO CLI TERMINAL
  if (activeVariant === "retro-cli-terminal") {
    return (
      <div className="rounded-3xl bg-black border border-emerald-500/40 p-6 sm:p-10 font-mono text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-emerald-500/20 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-2 text-white/60">studio-terminal ~ bash</span>
        </div>

        <div className="space-y-4">
          <p className="text-xs">$ studio --fetch-records --all</p>
          <div className="space-y-4 pl-4 border-l-2 border-emerald-500/40">
            {allItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-bold text-white text-sm">
                  &gt; [{idx + 1}] {item.title.toUpperCase()}
                </p>
                <p className="text-xs text-emerald-300/80 pl-4">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-4">
            <span className="text-xs">$</span>
            <span className="w-2 h-4 bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT / STANDARD EDITORIAL FALLBACK
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {allItems.map((item, idx) => (
        <div
          key={idx}
          className="p-8 rounded-3xl bg-[#0e0f18] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-1"
        >
          {item.image && (
            <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-900 border border-white/10 mb-2">
              <img src={getOptimizedImageUrl(item.image, 800)} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
            {item.description && <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
