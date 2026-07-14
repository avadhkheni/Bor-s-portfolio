"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// ─── Wireframe Globe ────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      className="w-full h-full"
    >
      <circle cx="60" cy="60" r="46" />
      <ellipse cx="60" cy="60" rx="18" ry="46" />
      <ellipse cx="60" cy="60" rx="34" ry="46" />
      <ellipse cx="60" cy="60" rx="46" ry="12" />
      <ellipse cx="60" cy="60" rx="46" ry="26" />
      <line x1="14" y1="60" x2="106" y2="60" />
      <line x1="60" y1="14" x2="60" y2="106" />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectStackItem = {
  id: string;
  title: string;
  category: string;
  year: string;
  imageColor: string;
  imageUrl?: string;
  href?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active;
  if (!loop || len <= 1) return raw;
  const alt = raw > 0 ? raw - len : raw + len;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

// ─── Inner Card Face ─────────────────────────────────────────────────────────

function ProjectCardFace({
  item,
  isActive,
}: {
  item: ProjectStackItem;
  isActive: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-[#0d0d0d]">
      {/* Background gradient wash */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${item.imageColor} opacity-25 transition-opacity duration-500`}
        style={{ opacity: isActive ? 0.35 : 0.18 }}
      />

      {/* Optional real image */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          draggable={false}
        />
      )}

      {/* Globe — subtly brighter on active */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: isActive ? 0.45 : 0.22 }}
      >
        <div
          className="text-white/70 transition-transform duration-700"
          style={{
            width: "clamp(80px, 30%, 130px)",
            height: "clamp(80px, 30%, 130px)",
            transform: isActive ? "scale(1.06)" : "scale(1)",
          }}
        >
          <GlobeIcon />
        </div>
      </div>

      {/* Year badge — top left */}
      <div className="absolute top-4 left-4 z-10">
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80 backdrop-blur-sm">
          {item.year}
        </span>
      </div>

      {/* Bottom vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.18) 40%, transparent 65%)",
        }}
      />
      {/* Top vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 28%)",
        }}
      />

      {/* Content row — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between p-5">
        <div className="flex max-w-[78%] flex-col gap-0.5">
          <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-[0.22em] text-white/50">
            {item.category}
          </p>
          <h3
            className="font-bold leading-snug tracking-tight text-white"
            style={{ fontSize: "clamp(13px, 2vw, 17px)" }}
          >
            {item.title}
          </h3>
        </div>

        {/* Arrow button */}
        <div
          className="ml-4 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all duration-300"
          style={
            isActive
              ? { borderColor: "white", background: "white", color: "black" }
              : {}
          }
        >
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Card Stack ───────────────────────────────────────────────────────────────

export type ProjectCardStackProps = {
  items: ProjectStackItem[];
  initialIndex?: number;
  /** How many cards visible on each side of active */
  sideCards?: number;
  cardWidth?: number;
  cardHeight?: number;
  /** Horizontal gap between stacked cards (px) */
  spreadPx?: number;
  /** Fan rotation step per offset (deg) */
  spreadDeg?: number;
  /** Z-depth separation per step (px) */
  depthPx?: number;
  /** Background-card tilt on X axis (deg) */
  tiltXDeg?: number;
  /** Lift the active card upward (px) */
  activeLiftPx?: number;
  activeScale?: number;
  inactiveScale?: number;
  springStiffness?: number;
  springDamping?: number;
  loop?: boolean;
  showDots?: boolean;
  className?: string;
};

export function ProjectCardStack({
  items,
  initialIndex = 0,
  sideCards = 3,
  cardWidth = 520,
  cardHeight = 340,
  spreadPx = 200,
  spreadDeg = 10,
  depthPx = 90,
  tiltXDeg = 10,
  activeLiftPx = 28,
  activeScale = 1.04,
  inactiveScale = 0.92,
  springStiffness = 300,
  springDamping = 30,
  loop = true,
  showDots = true,
  className,
}: ProjectCardStackProps) {
  const reduceMotion = useReducedMotion();
  const len = items.length;

  const [active, setActive] = React.useState(() => wrapIndex(initialIndex, len));

  React.useEffect(() => {
    setActive((a) => wrapIndex(a, len));
  }, [len]);

  const goTo = (idx: number) => setActive(wrapIndex(idx, len));
  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  if (!len) return null;

  return (
    <div className={`w-full ${className ?? ""}`}>
      {/* Stage */}
      <div
        className="relative w-full"
        style={{ height: cardHeight + 120 }}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* Ambient spotlight glow under cards */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto rounded-full blur-3xl"
          style={{
            height: 80,
            width: "60%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Perspective container */}
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ perspective: "1200px" }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const off = signedOffset(i, active, len, loop);
              const abs = Math.abs(off);
              if (abs > sideCards) return null;

              const isActive = off === 0;
              const x = off * spreadPx;
              const y = abs * 14;
              const rotateZ = off * spreadDeg;
              const rotateX = isActive ? 0 : tiltXDeg;
              const scale = isActive ? activeScale : inactiveScale;
              const lift = isActive ? -activeLiftPx : 0;
              const zIndex = 100 - abs;

              // Drag only on active
              const dragProps = isActive
                ? {
                    drag: "x" as const,
                    dragConstraints: { left: 0, right: 0 },
                    dragElastic: 0.15,
                    onDragEnd: (
                      _e: MouseEvent | TouchEvent | PointerEvent,
                      info: { offset: { x: number }; velocity: { x: number } }
                    ) => {
                      if (reduceMotion) return;
                      const t = info.offset.x;
                      const v = info.velocity.x;
                      const thresh = Math.min(140, cardWidth * 0.2);
                      if (t > thresh || v > 600) prev();
                      else if (t < -thresh || v < -600) next();
                    },
                  }
                : {};

              return (
                <motion.div
                  key={item.id}
                  className={`absolute bottom-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl will-change-transform select-none ${
                    isActive
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-pointer"
                  }`}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    zIndex,
                    transformStyle: "preserve-3d",
                  }}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: y + 50, x, rotateZ, rotateX, scale }
                  }
                  animate={{
                    opacity: 1,
                    x,
                    y: y + lift,
                    rotateZ,
                    rotateX,
                    scale,
                  }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{
                    type: "spring",
                    stiffness: springStiffness,
                    damping: springDamping,
                  }}
                  onClick={() => !isActive && setActive(i)}
                  {...dragProps}
                >
                  {/* translateZ on inner wrapper for real depth */}
                  <div
                    className="h-full w-full"
                    style={{
                      transform: `translateZ(${-abs * depthPx}px)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <ProjectCardFace item={item} isActive={isActive} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Dots */}
      {showDots && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {items.map((it, idx) => {
            const on = idx === active;
            return (
              <button
                key={it.id}
                onClick={() => goTo(idx)}
                aria-label={`Go to ${it.title}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: on ? 24 : 8,
                  height: 8,
                  background: on ? "white" : "rgba(255,255,255,0.25)",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
