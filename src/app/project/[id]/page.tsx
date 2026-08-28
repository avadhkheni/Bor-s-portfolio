"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Maximize2, X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { ALL_PROJECTS } from "@/lib/projects-data";
import { useSiteContent } from "@/lib/content-context";
import { Navbar } from "@/components/ui/navbar";

export default function ProjectPage() {
  const { data } = useSiteContent();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  // Dynamic projects from state as source of truth, fallback to static defaults only if empty
  const mergedProjects = React.useMemo(() => {
    if (data?.projects && Object.keys(data.projects).length > 0) {
      return data.projects;
    }
    return ALL_PROJECTS;
  }, [data?.projects]);

  const project = mergedProjects[id];
  const [isFullscreenImage, setIsFullscreenImage] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  // Collect all images for lightbox slider
  const allImages = React.useMemo(() => {
    if (!project) return [];
    return [project.imageSrc, ...(project.secondaryImages || [])].filter(Boolean);
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
        <p className="text-white/60 mb-8 max-w-md">
          The requested showcase item &quot;{id}&quot; does not exist or has been relocated.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Showcase
        </Link>
      </div>
    );
  }

  // Get project key list for next/prev navigation
  const projectKeys = Object.keys(mergedProjects);
  const currentIndex = projectKeys.indexOf(id);
  const prevId = projectKeys[(currentIndex - 1 + projectKeys.length) % projectKeys.length];
  const nextId = projectKeys[(currentIndex + 1) % projectKeys.length];
  const prevProject = mergedProjects[prevId] || project;
  const nextProject = mergedProjects[nextId] || project;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 selection:text-white flex flex-col">
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-1 pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Navigation / Back Bar */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8 pb-6 border-b border-white/10"
        >
          <button
            onClick={() => router.push("/#showcase")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Showcase
          </button>

          {/* Direct Live Site Link */}
          {project.url && (
            <a
              href={`https://${project.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white hover:text-black border border-white/20 px-4 py-2 rounded-full transition-all duration-300 shadow-lg"
            >
              <span>Visit {project.url}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </motion.div>

        {/* Project Header Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-white/80 border border-white/10">
              {project.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-white/60 border border-white/10">
              {project.year}
            </span>
            {project.tag && (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/30">
                {project.tag}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
            {project.title}
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </motion.div>

        {/* Primary Hero Image / Mockup Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative group rounded-2xl overflow-hidden border border-white/15 bg-[#0e0e12] shadow-2xl mb-16"
        >

          {/* High-res Image View */}
          <div
            onClick={() => {
              setActiveImageIndex(0);
              setIsFullscreenImage(true);
            }}
            className="relative cursor-pointer overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-neutral-950"
          >
            <img
              src={project.imageSrc}
              alt={project.title}
              className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-102"
            />
            {/* Click overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium text-sm flex items-center gap-2">
                <Maximize2 className="w-4 h-4" /> Click to Expand Full Image
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Meta Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 border-y border-white/10 mb-16">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Client</h4>
            <p className="text-base font-semibold text-white">{project.client || "Client Studio"}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Role & Discipline</h4>
            <p className="text-base font-semibold text-white">{project.role || "Lead Creative & Interface"}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Year</h4>
            <p className="text-base font-semibold text-white">{project.year}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Tools & Technologies</h4>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(project.tools || ["Next.js", "Framer Motion", "Tailwind"]).map((t) => (
                <span key={t} className="text-xs bg-white/10 text-white/80 px-2.5 py-0.5 rounded-md font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge & Solution Breakdown */}
        {(project.challenge || project.solution) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            {project.challenge && (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-red-400 mb-4 font-bold text-sm tracking-wide uppercase">
                  <Sparkles className="w-4 h-4" /> Design Challenge
                </div>
                <p className="text-white/80 leading-relaxed text-base">
                  {project.challenge}
                </p>
              </div>
            )}

            {project.solution && (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 mb-4 font-bold text-sm tracking-wide uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Architectural Solution
                </div>
                <p className="text-white/80 leading-relaxed text-base">
                  {project.solution}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Secondary Images Gallery Grid */}
        {allImages.length > 1 && (
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-6">Gallery & Visual Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setActiveImageIndex(i);
                    setIsFullscreenImage(true);
                  }}
                  className="relative group rounded-xl overflow-hidden border border-white/15 bg-neutral-900 aspect-[16/10] cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`${project.title} asset ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Pagination: Next & Previous Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 border-t border-white/10">
          <Link
            href={`/project/${prevId}`}
            className="group p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30 transition-all flex items-center gap-4"
          >
            <ChevronLeft className="w-6 h-6 text-white/50 group-hover:text-white transition-colors flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-xs uppercase font-bold text-white/40 tracking-wider block">Previous Project</span>
              <span className="text-base font-bold text-white group-hover:underline truncate block">{prevProject.title}</span>
            </div>
          </Link>

          <Link
            href={`/project/${nextId}`}
            className="group p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30 transition-all flex items-center justify-between"
          >
            <div className="overflow-hidden">
              <span className="text-xs uppercase font-bold text-white/40 tracking-wider block">Next Project</span>
              <span className="text-base font-bold text-white group-hover:underline truncate block">{nextProject.title}</span>
            </div>
            <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors flex-shrink-0 ml-4" />
          </Link>
        </div>
      </main>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      <AnimatePresence>
        {isFullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm sm:text-base">{project.title}</span>
                <span className="text-xs text-white/50 hidden sm:inline">({activeImageIndex + 1} of {allImages.length})</span>
              </div>
              <button
                onClick={() => setIsFullscreenImage(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close image viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Main Image Display */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={allImages[activeImageIndex]}
                alt={project.title}
                className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl"
              />

              {/* Slider controls if multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-4 w-12 h-12 rounded-full bg-black/60 border border-white/20 hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-4 w-12 h-12 rounded-full bg-black/60 border border-white/20 hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail selector */}
            {allImages.length > 1 && (
              <div className="flex items-center justify-center gap-3 z-10">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? "border-white scale-110" : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
