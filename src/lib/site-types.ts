export interface ShowcaseCardItem {
  id: string;
  title: string;
  url: string;
  imageSrc: string;
  tag?: string;
}

export interface ProjectDetail {
  id: string;
  title: string;
  category: string;
  year: string;
  url: string;
  imageSrc: string;
  secondaryImages?: string[];
  tag?: string;
  description: string;
  challenge?: string;
  solution?: string;
  client?: string;
  role?: string;
  tools?: string[];
}

export interface ParallaxItem {
  src: string;
  alt: string;
}

export interface ProcessStep {
  num: string;
  title: string;
  description: string;
  details: string[];
  image: string;
}

export interface SocialLink {
  name: string;
  url: string;
}

export interface BrandSettings {
  name: string;
  tagline: string;
  navCtaText: string;
}

export type SectionTemplateType =
  | "services"
  | "marquee-banner"
  | "stats"
  | "testimonials"
  | "faq"
  | "split-showcase"
  | "client-logos"
  | "pricing-table"
  | "tech-stack"
  | "awards-rack"
  | "comparison-slider"
  | "video-reel"
  | "team-grid"
  | "timeline-roadmap"
  | "journal-preview"
  | "press-mentions"
  | "audio-player";

export type AnimationPreset =
  | "fade-up"
  | "3d-tilt"
  | "zoom-in"
  | "blur-reveal"
  | "kinetic-slide";

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  icon?: string;
  image?: string;
  value?: string;
  details?: string[];
  link?: string;
}

export interface CustomSection {
  id: string;
  type: SectionTemplateType;
  enabled: boolean;
  badge?: string;
  title: string;
  subtitle?: string;
  animation: AnimationPreset;
  animationSpeed?: number;
  glowColor?: "blue" | "purple" | "cyan" | "emerald" | "none";
  items: CustomSectionItem[];
  bannerText?: string;
  bannerSpeed?: number;
}

export interface PreloaderSettings {
  studioLabel: string;
  loadingLabel: string;
  bottomLeft: string;
  bottomRight: string;
  words: string[];
}

export interface PageBlock {
  id: string;
  type: "hero" | "text" | "grid" | "media-split" | "quote" | "stats" | "gallery" | "faq" | "timeline" | "cta";
  title?: string;
  subtitle?: string;
  content?: string;
  badge?: string;
  items?: Array<{
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    value?: string;
    tag?: string;
    details?: string[];
  }>;
  image?: string;
  images?: string[];
  quote?: string;
  author?: string;
  ctaText?: string;
  ctaLink?: string;
  animation?: AnimationPreset;
}

export type PageLayoutVariant =
  | "standard-editorial"
  | "cinema-horizontal"
  | "bento-grid"
  | "brutalist-index"
  | "editorial-lookbook"
  | "cyber-hud"
  | "3d-card-stack"
  | "radial-orbital"
  | "split-duel-scroll"
  | "immersive-fullscreen-zoom"
  | "interactive-matrix-table"
  | "glassmorphism-studio"
  | "kinetic-type-river"
  | "swiss-modernist"
  | "isometric-3d"
  | "liquid-distortion"
  | "retro-cli-terminal"
  | "newspaper-broadside"
  | "spotlight-darkroom"
  | "infinite-spatial-board"
  | "3d-carousel-wheel";

export interface CustomPage {
  slug: string;
  title: string;
  subtitle: string;
  badge?: string;
  coverImage?: string;
  category: "studio" | "work" | "services" | "lab" | "resources";
  variant?: PageLayoutVariant;
  metaDescription?: string;
  featuredInNav?: boolean;
  isPublished?: boolean;
  blocks: PageBlock[];
}

export interface AdminUser {
  id: string;
  name?: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin";
  createdAt: string;
  lastLogin?: string;
}

export interface SmtpSettings {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromName?: string;
}

export interface SecuritySettings {
  accounts: AdminUser[];
  maxAccounts: 2;
  smtp?: SmtpSettings;
  activeOtp?: {
    email: string;
    code: string;
    expiresAt: number;
    attempts?: number;
  };
  failedAttempts?: Record<string, { count: number; lockedUntil: number }>;
}

export interface SiteData {
  brand?: BrandSettings;
  preloader?: PreloaderSettings;
  hero: {
    subtitle?: string;
    words: string[];
    morphTime: number;
    cooldownTime: number;
    scrollText?: string;
  };
  parallaxImages: ParallaxItem[];
  showcase: {
    headerBadge: string;
    headerTitle: string;
    headerSubtitle: string;
    row1: ShowcaseCardItem[];
    row2: ShowcaseCardItem[];
  };
  projects: Record<string, ProjectDetail>;
  philosophy: {
    badge?: string;
    quote: string;
    author?: string;
  };
  process: {
    badge: string;
    title: string;
    subtitle?: string;
    steps: ProcessStep[];
  };
  customSections?: CustomSection[];
  customPages?: Record<string, CustomPage>;
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    email: string;
    socials: SocialLink[];
    copyright: string;
  };
  cloudStorage?: {
    provider?: "imgbb" | "local";
    imgbbApiKey?: string;
    cloudHistory?: string[];
  };
  security?: SecuritySettings;
}
