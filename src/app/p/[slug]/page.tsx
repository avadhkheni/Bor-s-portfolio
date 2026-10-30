"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteContent } from "@/lib/content-context";
import { DEFAULT_PAGES_DATA } from "@/lib/default-pages-data";
import { CustomPage, PageBlock } from "@/lib/site-types";
import { AppImage } from "@/components/ui/app-image";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Layers,
  Compass,
  ArrowRight,
  Share2,
  Check,
  LayoutGrid,
} from "lucide-react";
import { PageVarietyRenderer, VARIETY_OPTIONS } from "@/components/ui/page-varieties";
import { PageLayoutVariant } from "@/lib/site-types";

export default function DynamicCustomPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const { data } = useSiteContent();

  const [activeFaqId, setActiveFaqId] = React.useState<string | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Resolve page from live customPages or default template dataset
  const page: CustomPage | undefined =
    data?.customPages?.[slug] || DEFAULT_PAGES_DATA[slug];

  const [selectedVariant, setSelectedVariant] = React.useState<PageLayoutVariant>(
    page?.variant || "standard-editorial"
  );

  React.useEffect(() => {
    if (page?.variant) {
      setSelectedVariant(page.variant);
    }
  }, [page?.variant]);

  const isLiveActive = Boolean(data?.customPages?.[slug]);

  const allPagesList = React.useMemo(() => {
    const active = Object.values(data?.customPages || {}).filter((p) => p.isPublished !== false);
    return active.length > 0 ? active : Object.values(DEFAULT_PAGES_DATA);
  }, [data?.customPages]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!page) {
    return (
      <div className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-white/50 max-w-md text-sm">
          The custom page &ldquo;{slug}&rdquo; does not exist or has not been created yet.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-blue-500 selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Template Preview Banner (If viewing a template not yet published by user) */}
      {!isLiveActive && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between relative z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Template Preview Mode: This page design is not yet activated on your live site.</span>
          </div>
          <Link
            href="/admin"
            className="px-3 py-1 rounded bg-black/40 hover:bg-black/60 text-white text-[11px] font-bold uppercase transition-colors"
          >
            Customize &amp; Publish in Admin &rarr;
          </Link>
        </div>
      )}

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vw] max-w-5xl rounded-full bg-blue-600/10 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[160px]" />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#07080c]/80 backdrop-blur-xl border-b border-white/10 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Share"}</span>
          </button>
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Edit in Admin
          </Link>
        </div>
      </header>

      {/* PAGE HERO HEADER */}
      <section className="pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl space-y-6"
        >
          {page.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/80">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {page.badge}
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white leading-[1.05]">
            {page.title}
          </h1>

          <p className="text-lg sm:text-xl text-white/70 font-light leading-relaxed max-w-3xl">
            {page.subtitle}
          </p>
        </motion.div>

        {page.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 rounded-3xl overflow-hidden aspect-[21/9] bg-neutral-900 border border-white/10 shadow-2xl relative"
          >
            <AppImage
              src={page.coverImage}
              alt={page.title}
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </motion.div>
        )}

        {/* 20 LAYOUT VARIETIES LIVE SWITCHER TOOLBAR */}
        <div className="mt-12 pt-8 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                Interactive Page Layout Variety ({VARIETY_OPTIONS.length} Themes)
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/40">
              Active: {VARIETY_OPTIONS.find((v) => v.id === selectedVariant)?.name || selectedVariant}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {VARIETY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedVariant(opt.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedVariant === opt.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10"
                }`}
                title={opt.desc}
              >
                <span>{opt.icon}</span>
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RENDER DYNAMIC PAGE VARIETY */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-12 relative z-10">
        <PageVarietyRenderer page={page} activeVariant={selectedVariant} />
      </section>

      {/* PAGE CONTENT BLOCKS */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 pb-24 space-y-20 relative z-10">
        {(page.blocks || []).map((block, bIdx) => (
          <motion.div
            key={block.id || bIdx}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Block Header */}
            {(block.title || block.badge) && (
              <div className="space-y-2 max-w-3xl">
                {block.badge && (
                  <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">
                    {block.badge}
                  </span>
                )}
                {block.title && (
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                    {block.title}
                  </h2>
                )}
              </div>
            )}

            {/* 1. TEXT BLOCK */}
            {block.type === "text" && block.content && (
              <div className="max-w-4xl p-8 sm:p-12 rounded-3xl bg-[#0e0f18] border border-white/10 shadow-xl">
                <p className="text-base sm:text-xl text-white/80 leading-relaxed font-light">
                  {block.content}
                </p>
              </div>
            )}

            {/* 2. STATS BLOCK */}
            {block.type === "stats" && block.items && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {block.items.map((stat, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-8 rounded-3xl bg-[#0e0f18] border border-white/10 text-center flex flex-col justify-center items-center shadow-xl group hover:border-blue-500/50 transition-colors"
                  >
                    <span className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-400 tracking-tight mb-2">
                      {stat.value || stat.title}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-bold text-white/80">
                      {stat.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 3. GRID BLOCK */}
            {block.type === "grid" && block.items && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {block.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="p-8 rounded-3xl bg-[#0e0f18] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-1"
                  >
                    {item.image && (
                      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-900 border border-white/10 mb-2">
                        <AppImage src={item.image} alt={item.title} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          {item.title}
                        </h3>
                        {item.tag && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs font-mono text-blue-400">
                          {item.subtitle}
                        </p>
                      )}
                      {item.value && (
                        <div className="text-2xl font-extrabold text-white">
                          {item.value}
                        </div>
                      )}
                      {item.description && (
                        <p className="text-sm text-white/60 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {item.details && item.details.length > 0 && (
                      <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
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
                  </div>
                ))}
              </div>
            )}

            {/* 4. TIMELINE BLOCK */}
            {block.type === "timeline" && block.items && (
              <div className="space-y-4 max-w-4xl">
                {block.items.map((step, stIdx) => (
                  <div
                    key={stIdx}
                    className="p-6 sm:p-8 rounded-2xl bg-[#0e0f18] border border-white/10 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 shadow-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                      {stIdx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-bold text-white">{step.title}</h3>
                      {step.description && (
                        <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. FAQ BLOCK */}
            {block.type === "faq" && block.items && (
              <div className="max-w-3xl space-y-3">
                {block.items.map((item, fIdx) => {
                  const isOpen = activeFaqId === String(fIdx);
                  return (
                    <div
                      key={fIdx}
                      className="rounded-2xl bg-[#0e0f18] border border-white/10 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaqId(isOpen ? null : String(fIdx))}
                        className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                      >
                        <span className="text-base sm:text-lg font-bold text-white">
                          {item.title}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-white/50 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-blue-400" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6 pb-6 pt-1 text-sm text-white/70 leading-relaxed border-t border-white/5"
                          >
                            {item.description}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 6. CTA BLOCK */}
            {block.type === "cta" && (
              <div className="p-8 sm:p-16 rounded-3xl bg-gradient-to-tr from-blue-950/40 via-[#0e0f18] to-purple-950/30 border border-white/15 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2 max-w-2xl">
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {block.title}
                  </h3>
                  {block.subtitle && (
                    <p className="text-sm sm:text-base text-white/70 font-light">
                      {block.subtitle}
                    </p>
                  )}
                </div>
                {block.ctaText && (
                  <Link
                    href={block.ctaLink || "/#contact"}
                    className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl shadow-blue-600/30 shrink-0 inline-flex items-center gap-2"
                  >
                    <span>{block.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </main>

      {/* EXPLORE OTHER STUDIO PAGES CAROUSEL / DIRECTORY */}
      <section className="bg-black border-t border-white/10 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">
                Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Explore Studio Pages ({allPagesList.length})
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white flex items-center gap-1"
            >
              <span>Back to Home</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allPagesList.map((p) => (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group ${
                  p.slug === slug
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-white/[0.02] border-white/10 hover:border-white/30 text-white/80 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
                  {p.category}
                </div>
                <div className="text-sm font-bold group-hover:text-blue-400 transition-colors">
                  {p.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-white/40 font-mono">
        &copy; {new Date().getFullYear()} {data?.brand?.name || "STUDIO"}. All custom pages are published live.
      </footer>
    </div>
  );
}
