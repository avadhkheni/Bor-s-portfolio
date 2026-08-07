"use client";

import * as React from "react";
import { gsap } from "@/lib/gsap";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLDivElement>(null);
  const wordRef = React.useRef<HTMLDivElement>(null);
  const [count, setCount] = React.useState(0);
  const [wordIndex, setWordIndex] = React.useState(0);

  const words = [
    "POSITIONING",
    "STRATEGY",
    "TYPOGRAPHY",
    "AESTHETICS",
    "MINIMALISM",
    "PACKAGING",
    "EXPERIENCE",
    "DESIGN"
  ];

  React.useEffect(() => {
    const counterObj = { value: 0 };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 1.4,
            ease: "power4.inOut",
            onComplete: onComplete
          });
        }
      });

      tl.to(counterObj, {
        value: 100,
        duration: 3,
        ease: "power3.out",
        onUpdate: () => {
          const val = Math.floor(counterObj.value);
          setCount(val);

          const index = Math.min(
            Math.floor((val / 100) * words.length),
            words.length - 1
          );
          setWordIndex(index);
        }
      });

      tl.to([counterRef.current, wordRef.current], {
        opacity: 0,
        y: -60,
        duration: 0.4,
        ease: "power2.in"
      }, "-=0.4");
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[9999] flex flex-col justify-between p-8 md:p-16 select-none overflow-hidden"
    >
      {/* Top logo block */}
      <div className="flex justify-between items-center w-full">
        <span className="text-sm font-bold tracking-widest text-white/40">STUDIO</span>
        <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">LOADING...</span>
      </div>

      {/* Middle massive block */}
      <div className="flex flex-col items-start justify-center flex-1 max-w-5xl mx-auto w-full my-auto">
        <div 
          ref={wordRef}
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white/30 h-20 sm:h-28 md:h-36 flex items-center select-none"
        >
          {words[wordIndex]}
        </div>
        <div 
          ref={counterRef}
          className="text-8xl sm:text-[12rem] md:text-[16rem] font-bold tracking-tighter text-white leading-none flex items-baseline gap-2 select-none"
        >
          <span>{count.toString().padStart(3, "0")}</span>
          <span className="text-2xl sm:text-4xl md:text-5xl text-white/30">%</span>
        </div>
      </div>

      {/* Bottom info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end w-full gap-4 text-xs font-bold text-white/20 uppercase tracking-widest">
        <div>VISUAL ARCHITECTURE</div>
        <div>CREATING DISTINCT DESIGN EMPIRES</div>
      </div>
    </div>
  );
}
