"use client";

import * as React from "react";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import { useSiteContent } from "@/lib/content-context";

export function ContactForm() {
  const { data } = useSiteContent();
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    projectType: "Identity",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsSubmitted(true);
        setFormState({ name: "", email: "", projectType: "Identity", message: "" });
      } else {
        setErrorMessage(result.error || "Failed to send message. Please try again.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = ["Identity", "Packaging", "Full Strategy", "Other"];

  const contactData = data?.contact || {
    badge: "Inquiries",
    title: "Let's co-create your brand's future",
    subtitle: "Whether initializing a new venture or elevating an established name, let's talk design.",
    email: "info@artsavvy.co.in",
    socials: [
      { name: "Behance", url: "https://behance.net" },
      { name: "Dribbble", url: "https://dribbble.com" },
      { name: "LinkedIn", url: "https://linkedin.com" },
      { name: "Instagram", url: "https://instagram.com" }
    ],
    copyright: "STUDIO. ALL RIGHTS RESERVED."
  };

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
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-red-600 rounded-full inline-block" />
                <span className="text-xs font-semibold uppercase tracking-widest text-white">
                  {contactData.badge || "Inquiries"}
                </span>
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-neutral-300 leading-tight">
                {contactData.title || "Let's co-create your brand's future"}
              </h2>
              <p className="mt-6 text-base text-white/70 max-w-sm leading-relaxed">
                {contactData.subtitle || "Whether initializing a new venture or elevating an established name, let's talk design."}
              </p>
            </div>

            <div className="mt-12 md:mt-24 space-y-6">
              <div>
                <p className="text-xs uppercase font-semibold text-white/50 tracking-wider">Direct Email</p>
                <a
                  href={`mailto:${contactData.email || "info@artsavvy.co.in"}`}
                  className="mt-1 block text-lg font-bold text-white hover:text-white/80 transition-colors"
                >
                  {contactData.email || "info@artsavvy.co.in"}
                </a>
              </div>
              {contactData.socials && contactData.socials.length > 0 && (
                <div>
                  <p className="text-xs uppercase font-semibold text-white/50 tracking-wider">Social Channels</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                    {contactData.socials.map((social, idx) => (
                      <React.Fragment key={idx}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/70 hover:text-white transition-colors"
                        >
                          {social.name}
                        </a>
                        {idx < contactData.socials.length - 1 && (
                          <span className="text-white/30">•</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 rounded-3xl border border-white/20 bg-white/[0.01] p-8 md:p-12 glass">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-6" />
                <h3 className="text-2xl font-bold text-white tracking-tight">Message Dispatched!</h3>
                <p className="mt-3 text-sm text-white/70 max-w-sm">
                  Thank you for reaching out. Your project details have been successfully sent to{" "}
                  <span className="text-white font-medium">{contactData.email || "info@artsavvy.co.in"}</span>. We will review your inquiry and get back to you shortly.
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
                {errorMessage && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                
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
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white text-background font-bold tracking-wider uppercase text-xs transition-all duration-300 shadow-lg ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-white hover:text-black cursor-pointer hover:shadow-white/10"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      Initiate Project
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>

              </form>
            )}
          </div>
        </div>
        
        {/* Sub-footer Copyright */}
        <div className="mt-24 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} {contactData.copyright || "STUDIO. ALL RIGHTS RESERVED."}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </section>
  );
}
