import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PORTFOLIO | Brand & Visual Identity Designer",
  description: "Specializing in high-fidelity visual identity design, custom packaging, creative brand strategy, and kinetic digital experiences. View featured brand case studies.",
  keywords: ["Brand Design", "Visual Identity", "Packaging Design", "Creative Director", "Typography", "Logo Designer", "Portfolio"],
  authors: [{ name: "Design Studio" }],
  openGraph: {
    title: "PORTFOLIO | Brand & Visual Identity Designer",
    description: "Showcasing high-fidelity visual identity design, custom packaging, and creative brand strategy.",
    type: "website",
  },
};

import { ContentProvider } from "@/lib/content-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-white/30 selection:text-white">
        <ContentProvider>
          {children}
        </ContentProvider>
      </body>
    </html>
  );
}
