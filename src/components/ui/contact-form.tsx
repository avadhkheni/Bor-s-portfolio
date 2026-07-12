"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    projectType: "Identity",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    
    // Simulate submission
    setIsSubmitted(true);
    setFormState({ name: "", email: "", projectType: "Identity", message: "" });
  };

  const projectTypes = ["Identity", "Packaging", "Full Strategy", "Other"];

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 overflow-hidden border-t border-white/20 bg-background radial-grid"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-white">
                Inquiries
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Let's co-create <br />
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  your brand's future
                </span>
              </h2>
              <p className="mt-6 text-base text-white/70 max-w-sm leading-relaxed">
                Whether initializing a new venture or elevating an established name, let's talk design.
              </p>
            </div>

            <div className="mt-12 md:mt-24 space-y-6">
              <div>
                <p className="text-xs uppercase font-semibold text-white/50 tracking-wider">Direct Email</p>
                <a
                  href="mailto:inquire@aetherdesign.studio"
                  className="mt-1 block text-lg font-bold text-white hover:text-white/80 transition-colors"
                >
                  inquire@aetherdesign.studio
                </a>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-white/50 tracking-wider">Social Channels</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                  <a href="#" className="text-white/70 hover:text-white transition-colors">Behance</a>
                  <span className="text-white/30">•</span>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">Dribbble</a>
                  <span className="text-white/30">•</span>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">LinkedIn</a>
                  <span className="text-white/30">•</span>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">Instagram</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 rounded-3xl border border-white/20 bg-white/[0.01] p-8 md:p-12 glass">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-white animate-bounce mb-6" />
                <h3 className="text-2xl font-bold text-white tracking-tight">Message Received</h3>
                <p className="mt-3 text-sm text-white/70 max-w-xs">
                  Thank you for reaching out. We will get back to you within 24 business hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 text-xs font-semibold uppercase tracking-widest text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="contact-form" className="space-y-8">
                
                {/* Project Types Toggle */}
                <div>
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-widest block mb-4">
                    What are we designing?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormState({ ...formState, projectType: type })}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                          formState.projectType === type
                            ? "bg-white border-white text-black"
                            : "bg-transparent border-white/20 text-white hover:border-white/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name field */}
                <div className="relative group">
                  <input
                    type="text"
                    id="contact-name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-transparent focus:outline-none focus:border-white transition-colors text-base"
                    placeholder="Your Name"
                  />
                  <label
                    htmlFor="contact-name"
                    className="absolute left-0 top-3 text-white/50 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-white/50 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Your Name
                  </label>
                </div>

                {/* Email field */}
                <div className="relative group">
                  <input
                    type="email"
                    id="contact-email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-transparent focus:outline-none focus:border-white transition-colors text-base"
                    placeholder="Email Address"
                  />
                  <label
                    htmlFor="contact-email"
                    className="absolute left-0 top-3 text-white/50 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-white/50 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Email Address
                  </label>
                </div>

                {/* Message field */}
                <div className="relative group">
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-transparent focus:outline-none focus:border-white transition-colors text-base resize-none"
                    placeholder="Brief Project Scope"
                  />
                  <label
                    htmlFor="contact-message"
                    className="absolute left-0 top-3 text-white/50 text-base transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-white/50 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Brief Project Scope
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="contact-submit-button"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white text-background hover:bg-white hover:text-black font-bold tracking-wider uppercase text-xs transition-all duration-300 cursor-pointer shadow-lg hover:shadow-white/10"
                >
                  Initiate Project
                  <Send className="h-4 w-4" />
                </button>

              </form>
            )}
          </div>
        </div>
        
        {/* Sub-footer Copyright */}
        <div className="mt-24 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} ÆTHER STUDIO. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </section>
  );
}
