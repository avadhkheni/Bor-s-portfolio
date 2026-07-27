"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

export function TextRevealByWord({ text, className }: TextRevealByWordProps) {
  const targetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".reveal-word-fg",
        { opacity: 0 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: target,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [text]);

  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div className="sticky top-0 mx-auto flex h-screen max-w-5xl flex-col justify-between items-center bg-transparent px-6 py-24 md:py-32">
        {/* Our Creed Header */}
        <span className="text-xs font-semibold uppercase tracking-widest text-white block mb-4 select-none opacity-80">
          Our Creed
        </span>

        {/* Morphing scroll text */}
        <p className="flex flex-wrap justify-center text-center p-5 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.3] max-w-4xl">
          {words.map((word, i) => {
            // Support bold markdown-like formatting (**word**)
            const isBold = word.startsWith("**") && word.endsWith("**");
            const cleanWord = isBold ? word.slice(2, -2) : word;

            return (
              <span key={i} className="relative mx-1 lg:mx-2.5">
                {/* Background (inactive/unrevealed) state */}
                <span
                  className={cn(
                    "absolute opacity-15 select-none text-white",
                    isBold ? "font-extrabold text-white/30" : "font-light"
                  )}
                >
                  {cleanWord}
                </span>
                {/* Foreground (active/revealed) state */}
                <span
                  className={cn(
                    "reveal-word-fg text-white opacity-0",
                    isBold
                      ? "font-extrabold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text"
                      : "font-light"
                  )}
                >
                  {cleanWord}
                </span>
              </span>
            );
          })}
        </p>

        {/* Philosophy Footer */}
        <div className="flex justify-center items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/50 select-none">
          <span>DESIGN PHILOSOPHY</span>
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span>EST. 2020</span>
        </div>
      </div>
    </div>
  );
}
