"use client";

import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  CustomSection,
  CustomSectionItem,
  AnimationPreset,
} from "@/lib/site-types";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import {
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Layers,
  Zap,
  Shield,
  Activity,
  Award,
  Globe,
} from "lucide-react";

// Dynamic Icon Helper
function TemplateIcon({ name }: { name?: string }) {
  switch (name?.toLowerCase()) {
    case "zap":
    case "lightning":
      return <Zap className="w-5 h-5" />;
    case "shield":
    case "security":
      return <Shield className="w-5 h-5" />;
    case "activity":
    case "growth":
      return <Activity className="w-5 h-5" />;
    case "award":
    case "trophy":
      return <Award className="w-5 h-5" />;
    case "globe":
    case "world":
      return <Globe className="w-5 h-5" />;
    case "sparkles":
    default:
      return <Sparkles className="w-5 h-5" />;
  }
}

// Animation variants generator
function getAnimationVariants(preset: AnimationPreset, speed = 0.6): Variants {
  const transition = { duration: speed, ease: [0.22, 1, 0.36, 1] as const };

  switch (preset) {
    case "3d-tilt":
      return {
        hidden: { opacity: 0, rotateX: 15, y: 40, scale: 0.95 },
        visible: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          transition,
        },
      };
    case "zoom-in":
      return {
        hidden: { opacity: 0, scale: 0.85 },
        visible: {
          opacity: 1,
          scale: 1,
          transition,
        },
      };
    case "blur-reveal":
      return {
        hidden: { opacity: 0, filter: "blur(12px)", y: 20 },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          transition,
        },
      };
    case "kinetic-slide":
      return {
        hidden: { opacity: 0, x: -60 },
        visible: {
          opacity: 1,
          x: 0,
          transition,
        },
      };
    case "fade-up":
    default:
      return {
        hidden: { opacity: 0, y: 35 },
        visible: {
          opacity: 1,
          y: 0,
          transition,
        },
      };
  }
}

// Glow effect helper
function getGlowStyles(color?: string) {
  switch (color) {
    case "blue":
      return "bg-blue-500/10";
    case "purple":
      return "bg-purple-500/10";
    case "cyan":
      return "bg-cyan-500/10";
    case "emerald":
      return "bg-emerald-500/10";
    case "none":
    default:
      return "";
  }
}

export function DynamicCustomSectionRenderer({
  section,
}: {
  section: CustomSection;
}) {
  const [activeFaqId, setActiveFaqId] = React.useState<string | null>(null);
  const variants = React.useMemo(
    () => getAnimationVariants(section.animation, section.animationSpeed || 0.6),
    [section.animation, section.animationSpeed]
  );
  const glow = getGlowStyles(section.glowColor);

  if (!section.enabled) return null;

  return (
    <section
      id={`section-${section.id}`}
      className="relative py-24 px-6 md:px-12 bg-black border-t border-white/10 overflow-hidden"
    >
      {/* Ambient background glow */}
      {glow && (
        <div
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full blur-[140px] ${glow}`}
        />
      )}

      {/* 1. KINETIC TEXT MARQUEE BANNER */}
      {section.type === "marquee-banner" && (
        <div className="w-full overflow-hidden select-none py-6">
          <motion.div
            className="flex gap-8 w-max whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: section.bannerSpeed || 25,
              ease: "linear",
            }}
          >
            {[1, 2, 3, 4].map((repeatIdx) => (
              <div key={repeatIdx} className="flex items-center gap-8">
                <span className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter uppercase text-white/90">
                  {section.bannerText || section.title || "KINETIC DESIGN & FUTURE SYSTEMS"}
                </span>
                <span className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* STANDARD SECTION HEADER (FOR NON-BANNER TYPES) */}
      {section.type !== "marquee-banner" && (
        <div className="max-w-7xl mx-auto mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={variants}
            className="max-w-3xl"
          >
            {section.badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/70 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {section.badge}
              </div>
            )}
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mt-4 text-base sm:text-lg text-white/60 leading-relaxed">
                {section.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* CONTENT TEMPLATES */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 2. SERVICES & CAPABILITIES GRID */}
        {section.type === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={variants}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-8 rounded-3xl bg-[#0e0f18] border border-white/10 hover:border-white/30 transition-all duration-500 flex flex-col justify-between hover:-translate-y-1.5 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <TemplateIcon name={item.icon} />
                    </div>
                    {item.tag && (
                      <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {item.details && item.details.length > 0 && (
                  <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2">
                    {item.details.map((detail, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-xs font-mono bg-white/5 px-2.5 py-1 rounded-md text-white/80 border border-white/5"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* 3. STATS & METRICS COUNTERS */}
        {section.type === "stats" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-[#0e0f18] border border-white/10 text-center flex flex-col justify-center items-center shadow-xl group hover:border-blue-500/50 transition-colors"
              >
                <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-400 tracking-tight mb-2">
                  {item.value || item.title}
                </span>
                <span className="text-xs uppercase tracking-widest font-bold text-white/90 mb-1">
                  {item.title}
                </span>
                {item.description && (
                  <span className="text-[11px] text-white/50 leading-relaxed">
                    {item.description}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* 4. CLIENT TESTIMONIALS */}
        {section.type === "testimonials" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-[#0e0f18] border border-white/10 hover:border-white/25 flex flex-col justify-between space-y-6 shadow-xl"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, starI) => (
                    <Star key={starI} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm md:text-base text-white/80 leading-relaxed italic font-serif">
                  &ldquo;{item.description}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  {item.image ? (
                    <img
                      src={getOptimizedImageUrl(item.image, 100)}
                      alt={item.title}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs uppercase">
                      {item.title.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <span className="text-[11px] text-white/50 font-mono">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 5. FAQ / ACCORDION */}
        {section.type === "faq" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {section.items.map((item, idx) => {
              const isOpen = activeFaqId === (item.id || String(idx));
              return (
                <motion.div
                  key={item.id || idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={variants}
                  className="rounded-2xl bg-[#0e0f18] border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveFaqId(isOpen ? null : item.id || String(idx))
                    }
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="text-base sm:text-lg font-bold text-white">
                      {item.title}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/50 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-400" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 pt-1 text-sm text-white/70 leading-relaxed border-t border-white/5 font-sans"
                      >
                        {item.description}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 6. SPLIT VISUAL SHOWCASE */}
        {section.type === "split-showcase" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {section.items[0] && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-neutral-900 border border-white/15 shadow-2xl group"
              >
                <img
                  src={getOptimizedImageUrl(section.items[0].image || "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384405/artsavvy/27.jpg", 1200)}
                  alt={section.items[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </motion.div>
            )}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={variants}
              className="space-y-6"
            >
              {section.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2"
                >
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-white/70 leading-relaxed pl-7">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* 7. CLIENT LOGOS CAROUSEL */}
        {section.type === "client-logos" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 flex items-center justify-center text-center font-bold tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all uppercase text-xs aspect-[3/2]"
              >
                {item.image ? (
                  <img
                    src={getOptimizedImageUrl(item.image, 400)}
                    alt={item.title}
                    className="max-h-8 object-contain filter grayscale hover:grayscale-0 transition-all"
                  />
                ) : (
                  item.title
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* 8. PRICING & ENGAGEMENT TIERS */}
        {section.type === "pricing-table" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {section.items.map((item, idx) => {
              const isPopular = idx === 1;
              return (
                <motion.div
                  key={item.id || idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={variants}
                  className={`p-8 rounded-3xl flex flex-col justify-between space-y-6 relative transition-all ${isPopular
                      ? "bg-gradient-to-b from-blue-950/40 to-[#0e0f18] border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:-translate-y-2"
                      : "bg-[#0e0f18] border border-white/10"
                    }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Most Selected
                    </span>
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-white">{item.title}</h4>
                      {item.tag && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    {item.value && (
                      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {item.value}
                      </div>
                    )}
                    {item.description && (
                      <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                  {item.link ? (
                    <a
                      href={item.link}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all ${isPopular
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                    >
                      Book Engagement &rarr;
                    </a>
                  ) : (
                    <div
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center ${isPopular ? "bg-blue-600 text-white" : "bg-white/10 text-white"
                        }`}
                    >
                      Inquire Tier
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 9. TECH STACK & SKILLS RADAR */}
        {section.type === "tech-stack" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="p-5 rounded-2xl bg-[#0c0d15] border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </span>
                  {item.tag && (
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {item.tag}
                    </span>
                  )}
                </div>
                {item.value && (
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full w-[85%]" />
                  </div>
                )}
                {item.description && (
                  <p className="text-[11px] text-white/50 line-clamp-2">{item.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* 10. AWARDS & TROPHY RACK */}
        {section.type === "awards-rack" && (
          <div className="divide-y divide-white/10 border-y border-white/10">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="py-6 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    {item.subtitle && <p className="text-xs text-white/50">{item.subtitle}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {item.tag && (
                    <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-white/5 text-amber-300 border border-amber-500/20">
                      {item.tag}
                    </span>
                  )}
                  {item.value && <span className="text-sm font-mono text-white/40">{item.value}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 11. BEFORE & AFTER COMPARISON */}
        {section.type === "comparison-slider" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="rounded-3xl overflow-hidden bg-[#0e0f18] border border-white/10 space-y-4 p-6"
              >
                <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white font-bold inline-block">
                  {item.tag || `STAGE 0${idx + 1}`}
                </span>
                {item.image && (
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                    <img src={getOptimizedImageUrl(item.image, 600)} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                {item.description && <p className="text-xs text-white/70">{item.description}</p>}
              </motion.div>
            ))}
          </div>
        )}

        {/* 12. PROJECT VIDEO / MOTION REEL */}
        {section.type === "video-reel" && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={variants}
            className="rounded-3xl overflow-hidden aspect-[21/9] bg-neutral-900 border border-white/15 shadow-2xl relative group flex items-center justify-center"
          >
            {section.items[0]?.image && (
              <img
                src={getOptimizedImageUrl(section.items[0].image, 1400)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="relative z-10 text-center space-y-4 p-6">
              <span className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center mx-auto shadow-xl cursor-pointer hover:scale-110 transition-transform">
                <ArrowUpRight className="w-6 h-6 rotate-45" />
              </span>
              <h4 className="text-2xl sm:text-4xl font-extrabold text-white">{section.items[0]?.title || section.title}</h4>
              <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto">{section.items[0]?.description || section.subtitle}</p>
            </div>
          </motion.div>
        )}

        {/* 13. TEAM COLLECTIVE GRID */}
        {section.type === "team-grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="rounded-3xl bg-[#0e0f18] border border-white/10 overflow-hidden space-y-4 p-6 group hover:-translate-y-1 transition-all"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/5">
                  <img
                    src={getOptimizedImageUrl(item.image || "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384405/artsavvy/27.jpg", 600)}
                    alt={item.title}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{item.title}</h4>
                  {item.subtitle && <p className="text-xs text-blue-400 font-mono mt-0.5">{item.subtitle}</p>}
                  {item.description && <p className="text-xs text-white/60 mt-2 leading-relaxed">{item.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 14. TIMELINE ROADMAP */}
        {section.type === "timeline-roadmap" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 flex items-start gap-4"
              >
                <span className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                    {item.tag && <span className="text-[10px] font-mono text-cyan-400">{item.tag}</span>}
                  </div>
                  {item.description && <p className="text-xs text-white/70 leading-relaxed">{item.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 15. JOURNAL PREVIEW */}
        {section.type === "journal-preview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="rounded-3xl bg-[#0e0f18] border border-white/10 overflow-hidden p-6 space-y-4 group hover:-translate-y-1 transition-all"
              >
                {item.image && (
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5">
                    <img src={getOptimizedImageUrl(item.image, 800)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">{item.tag || "Insight"}</span>
                  <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{item.title}</h4>
                  {item.description && <p className="text-xs text-white/60 line-clamp-2">{item.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 16. PRESS MENTIONS */}
        {section.type === "press-mentions" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {section.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variants}
                className="p-8 rounded-3xl bg-[#0e0f18] border border-white/10 space-y-4"
              >
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">{item.tag || "PRESS"}</span>
                <h4 className="text-lg font-bold text-white italic">&ldquo;{item.title}&rdquo;</h4>
                {item.description && <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>}
              </motion.div>
            ))}
          </div>
        )}

        {/* 17. AMBIENT AUDIO PLAYER / VISUALIZER */}
        {section.type === "audio-player" && (
          <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/30 to-blue-950/30 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-purple-400 tracking-widest font-bold">Studio Soundscape</span>
              <h4 className="text-xl font-bold text-white">{section.title}</h4>
              <p className="text-xs text-white/60">{section.subtitle || "Curated ambient sonic experience for creative focus."}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                {[40, 70, 25, 90, 50, 80, 30].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse inline-block h-6"
                  />
                ))}
              </span>
              <button
                type="button"
                className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors"
              >
                Listen Track
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function DynamicCustomSectionsList({
  sections,
}: {
  sections?: CustomSection[];
}) {
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <DynamicCustomSectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
