"use client";

import * as React from "react";
import { gsap } from "@/lib/gsap";
import Image from "next/image";
import { Compass, Palette, BookOpen, Rocket } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

import { useSiteContent } from "@/lib/content-context";

const defaultIcons = [
  <Compass key="0" className="h-6 w-6 text-white" />,
  <Palette key="1" className="h-6 w-6 text-white/80" />,
  <BookOpen key="2" className="h-6 w-6 text-white/60" />,
  <Rocket key="3" className="h-6 w-6 text-white" />,
];

interface CardStickyProps extends HTMLMotionProps<"div"> {
  index: number;
  incrementY?: number;
  incrementZ?: number;
}

const ContainerScroll = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{ perspective: "1000px", ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
});
ContainerScroll.displayName = "ContainerScroll";

const CardSticky = React.forwardRef<HTMLDivElement, CardStickyProps>(
  (
    {
      index,
      incrementY = 10,
      incrementZ = 10,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const y = index * incrementY;
    const z = index * incrementZ;

    return (
      <motion.div
        ref={ref}
        layout="position"
        style={{
          top: y,
          z,
          backfaceVisibility: "hidden",
          ...style,
        }}
        className={cn("sticky", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
CardSticky.displayName = "CardSticky";

export function ProcessSection() {
  const { data } = useSiteContent();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const steps = data?.process?.steps || [];

  React.useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background glow movement
      gsap.fromTo(
        ".bg-glow-process",
        { scale: 0.8, opacity: 0.1 },
        {
          scale: 1.2,
          opacity: 0.25,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative py-24 md:py-32 border-t border-white/20 bg-black"
    >
      {/* Background neon blur */}
      <div className="bg-glow-process pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] opacity-15"
        style={{
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Heading */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-red-600 rounded-full inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white">
              {data?.process?.badge || "Methodology"}
            </span>
          </div>
          <h2 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-neutral-300 leading-tight">
            {data?.process?.title || "A structured workflow for uncompromising visual results"}
          </h2>
          {data?.process?.subtitle && (
            <p className="mt-3 text-sm md:text-base text-white/50 leading-relaxed">
              {data.process.subtitle}
            </p>
          )}
        </div>

        {/* Sticky Scroll Container */}
        <ContainerScroll className="flex flex-col gap-12 max-w-4xl mx-auto pb-24">
          {steps.map((step, i) => (
            <CardSticky
              key={step.num || i}
              index={i}
              incrementY={30} // Offset spacing for stacked card headers
              incrementZ={15}  // 3D perspective camera Z-depth offset
              className="w-full bg-zinc-950 border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-8 items-stretch"
              style={{
                top: `${120 + i * 30}px`, // Stagger top position to allow clearance of navbar and stack tabs
                boxShadow: "0 -25px 50px -12px rgba(0,0,0,0.9)",
              }}
            >
              {/* Left Column: Text Info */}
              <div className="flex-1 flex flex-col justify-between h-full gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
                      {defaultIcons[i % defaultIcons.length]}
                    </div>
                    <span className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white/20 select-none">
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Bullet Points Details */}
                {step.details && step.details.length > 0 && (
                  <div className="border-t border-white/10 pt-4 mt-auto">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs md:text-sm text-white/50 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Image Showcase */}
              {step.image && (
                <div className="relative w-full md:w-[320px] lg:w-[400px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0 group">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-w-768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              )}
            </CardSticky>
          ))}
        </ContainerScroll>
      </div>
    </section>
  );
}
