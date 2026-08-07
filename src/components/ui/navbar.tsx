"use client";

import * as React from "react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <header
      id="navbar-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-4 bg-background/70 backdrop-blur-md border-b border-white/5"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Desktop Links */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("work")}
            id="nav-link-work"
            className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
          >
            Work
          </button>
          <button
            onClick={() => scrollToSection("process")}
            id="nav-link-process"
            className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
          >
            Process
          </button>
          <button
            onClick={() => scrollToSection("philosophy")}
            id="nav-link-philosophy"
            className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
          >
            Philosophy
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            id="nav-link-contact"
            className="text-sm font-medium text-foreground/80 hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => scrollToSection("contact")}
            id="nav-cta-button"
            className="relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest overflow-hidden transition-all duration-300 border border-white text-white hover:bg-white hover:text-black cursor-pointer"
          >
            Let's Talk
          </button>
        </div>
      </div>
    </header>
  );
}
