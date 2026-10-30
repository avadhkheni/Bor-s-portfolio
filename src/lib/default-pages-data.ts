import { CustomPage } from "./site-types";

export const DEFAULT_PAGES_DATA: Record<string, CustomPage> = {
  about: {
    slug: "about",
    title: "About the Studio",
    subtitle: "A modern design practice creating disciplined brand architecture and kinetic digital flagships.",
    badge: "Studio Ethos",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384405/artsavvy/27.jpg",
    category: "studio",
    metaDescription: "Learn about our philosophy, leadership, and obsessive craft.",
    featuredInNav: true,
    blocks: [
      {
        id: "b1",
        type: "text",
        title: "The Architecture of Distinction",
        badge: "Our Philosophy",
        content: "We believe that true brand prestige is neither loud nor decorative—it is architectural. In an era saturated with commoditized templates, we construct enduring visual identities, bespoke typography, and high-performance interactive environments that command reverence.",
      },
      {
        id: "b2",
        type: "stats",
        title: "By the Numbers",
        badge: "Impact",
        items: [
          { title: "Years of Craft", value: "8+" },
          { title: "Global Awards", value: "26" },
          { title: "Client Retention", value: "98%" },
          { title: "Brands Built", value: "110+" },
        ],
      },
      {
        id: "b3",
        type: "grid",
        title: "Core Tenets",
        badge: "Guiding Principles",
        items: [
          {
            title: "Zero Compromise on Typography",
            description: "Kerning, proportion, and hierarchy dictate the subconscious trust of any luxury entity.",
            tag: "Aesthetics",
          },
          {
            title: "Kinetic Fluidity",
            description: "Interaction should feel physical and frictionless, responding with natural inertia.",
            tag: "Engineering",
          },
          {
            title: "Enduring Over Trend-Chasing",
            description: "We build timeless frameworks designed to scale for decades, not months.",
            tag: "Longevity",
          },
        ],
      },
      {
        id: "b4",
        type: "cta",
        title: "Let's build something exceptional together.",
        subtitle: "Schedule an introductory creative consultation with our leadership.",
        ctaText: "Book Strategy Session",
        ctaLink: "/p/contact-booking",
      },
    ],
  },

  services: {
    slug: "services",
    title: "Capabilities & Services",
    subtitle: "Comprehensive creative direction spanning brand identity, kinetic engineering, and packaging.",
    badge: "What We Do",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384406/artsavvy/28.jpg",
    category: "services",
    metaDescription: "Explore our full suite of branding, web development, and structural packaging services.",
    featuredInNav: true,
    blocks: [
      {
        id: "s1",
        type: "grid",
        title: "Full-Spectrum Discipline",
        badge: "Practice Areas",
        items: [
          {
            title: "01. Brand Architecture & Identity",
            description: "Positioning strategy, bespoke logotypes, comprehensive design systems, color science, and brand guidelines.",
            details: ["Visual Identity Systems", "Brand Books & Styleguides", "Naming & Verbal Identity"],
          },
          {
            title: "02. Kinetic Flagship Web Engineering",
            description: "Bespoke digital experiences built with Next.js, WebGL shaders, Framer Motion, and ultra-fast page transitions.",
            details: ["Custom Next.js & React Apps", "Micro-Interactions & 3D", "High-Conversion E-Commerce"],
          },
          {
            title: "03. Tactile Packaging & Print Production",
            description: "Structural box engineering, bespoke foil stamping, embossing dielines, and sustainable material curation.",
            details: ["Luxury Box Prototyping", "Print Direction & Finishes", "Eco-Friendly Substrates"],
          },
          {
            title: "04. 3D Spatial & Motion Direction",
            description: "Hyper-realistic 3D product renders, spatial animations, kinetic typography, and campaign teasers.",
            details: ["CGI Product Simulations", "Social Launch Trailers", "Interactive 3D Viewers"],
          },
        ],
      },
      {
        id: "s2",
        type: "faq",
        title: "Engagement FAQs",
        badge: "Clarity",
        items: [
          {
            title: "How do you structure client projects?",
            description: "We operate on dedicated project sprint tiers and strategic monthly retainers with senior-only involvement.",
          },
          {
            title: "What is the typical turnaround time?",
            description: "Brand identity systems take 4-6 weeks; full digital flagships take 6-10 weeks.",
          },
        ],
      },
      {
        id: "s3",
        type: "cta",
        title: "Ready to elevate your category authority?",
        subtitle: "Review our transparent engagement packages or request a custom proposal.",
        ctaText: "View Pricing Tiers",
        ctaLink: "/p/pricing",
      },
    ],
  },

  archive: {
    slug: "archive",
    title: "Visual Work Archive",
    subtitle: "A chronological index of brand identity systems, digital platforms, and packaging artifacts.",
    badge: "2020 — 2026",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384407/artsavvy/29.jpg",
    category: "work",
    metaDescription: "Browse all client releases, packaging prototypes, and digital case studies.",
    featuredInNav: true,
    blocks: [
      {
        id: "a1",
        type: "grid",
        title: "Selected Artifacts & Releases",
        badge: "Catalog",
        items: [
          { title: "Verdelle Botanics", subtitle: "2025 • Luxury Identity & Glassware", tag: "Packaging & Web", image: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384410/artsavvy/30.jpg" },
          { title: "Apex Dynamics", subtitle: "2025 • High-Speed EV Branding", tag: "Kinetic UI", image: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384411/artsavvy/31.jpg" },
          { title: "Willow & Whisk", subtitle: "2024 • Artisanal Bakery Packaging", tag: "Print System", image: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384412/artsavvy/32.jpg" },
          { title: "Lumina Research Labs", subtitle: "2024 • AI Infrastructure Flagship", tag: "Next.js WebGL", image: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384412/artsavvy/33.jpg" },
          { title: "Natura Apothecary", subtitle: "2023 • Minimalist Skin Wellness", tag: "Full Scope", image: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384414/artsavvy/34.jpg" },
          { title: "Chronos Horology", subtitle: "2023 • Luxury Swiss Timepieces", tag: "CGI & Identity", image: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384414/artsavvy/35.jpg" },
        ],
      },
      {
        id: "a2",
        type: "cta",
        title: "Have a specific industry in mind?",
        subtitle: "We create tailored visual systems across technology, luxury, food, and culture.",
        ctaText: "Inquire About a Project",
        ctaLink: "/p/contact-booking",
      },
    ],
  },

  journal: {
    slug: "journal",
    title: "Studio Journal & Essays",
    subtitle: "Critical observations on design systems, kinetic aesthetics, and category positioning.",
    badge: "Thought Leadership",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384416/artsavvy/36.jpg",
    category: "resources",
    blocks: [
      {
        id: "j1",
        type: "grid",
        title: "Selected Writing",
        badge: "Essays",
        items: [
          {
            title: "The Death of Generic Flat Design",
            subtitle: "Published Nov 2025 • 6 min read",
            description: "Why tactile materiality, spatial physics, and custom typography are replacing sterile corporate minimalism.",
            tag: "Philosophy",
          },
          {
            title: "Kerning as a Subconscious Trust Factor",
            subtitle: "Published Aug 2025 • 4 min read",
            description: "An empirical breakdown of how subtle typographic micro-adjustments influence perceived product value.",
            tag: "Typography",
          },
          {
            title: "Building Digital Flagships at 60 FPS",
            subtitle: "Published May 2025 • 8 min read",
            description: "Architecting zero-jank Framer Motion animations with Next.js Turbopack and headless CMS.",
            tag: "Engineering",
          },
        ],
      },
    ],
  },

  awards: {
    slug: "awards",
    title: "Honors & Recognitions",
    subtitle: "Celebrating international acclaim for excellence in visual identity and digital design.",
    badge: "Trophy Case",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384417/artsavvy/37.jpg",
    category: "studio",
    blocks: [
      {
        id: "aw1",
        type: "grid",
        title: "Global Accolades",
        badge: "Accolades",
        items: [
          { title: "Awwwards Site of the Month", subtitle: "Lumina Labs Flagship (2025)", tag: "Awwwards", description: "Recognized for kinetic motion fluidity and typography." },
          { title: "D&AD Graphite Pencil", subtitle: "Verdelle Botanics Packaging (2024)", tag: "D&AD", description: "Awarded for sustainable structural box craftsmanship." },
          { title: "FWA of the Day", subtitle: "Apex EV Interactive (2024)", tag: "FWA", description: "Recognized for WebGL spatial visualizer." },
          { title: "Type Directors Club TDC69", subtitle: "Studio Editorial Specimen (2023)", tag: "TDC", description: "Honored for custom serif typography design." },
        ],
      },
    ],
  },

  experiments: {
    slug: "experiments",
    title: "Creative Coding & R&D Lab",
    subtitle: "Open-source shaders, generative geometry, and experimental web physics.",
    badge: "Interactive Lab",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384418/artsavvy/38.jpg",
    category: "lab",
    blocks: [
      {
        id: "exp1",
        type: "grid",
        title: "Experimental Studies",
        badge: "WebGL & Motion",
        items: [
          { title: "Fluid Distortion Shaders", description: "Interactive mouse-reactive GLSL displacement maps.", tag: "Three.js" },
          { title: "Kinetic Spring Physics", description: "Friction-based dragging containers with inertial velocity curves.", tag: "Framer Motion" },
          { title: "Audio-Reactive Geometry", description: "Procedural vertex deformations triggered by ambient sound frequencies.", tag: "Web Audio API" },
        ],
      },
    ],
  },

  "brand-guidelines": {
    slug: "brand-guidelines",
    title: "Interactive Brand Guidelines",
    subtitle: "A digital living design system showcasing color tokens, typography scales, and iconography rules.",
    badge: "Design System",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384419/artsavvy/39.jpg",
    category: "resources",
    blocks: [
      {
        id: "bg1",
        type: "grid",
        title: "Foundational Elements",
        badge: "Tokens",
        items: [
          { title: "Color Harmonies", description: "Deep obsidian darks (#07080c), neon cobalt accents (#2563eb), and stark white type.", tag: "Palette" },
          { title: "Typographic Ratio", description: "Harmonic 1.25 modular scale spanning 12px microcopy to 120px headline display.", tag: "Hierarchy" },
          { title: "Spatial Grid", description: "8pt mathematical baseline grid ensuring pixel-perfect rhythm on all viewports.", tag: "Layout" },
        ],
      },
    ],
  },

  "packaging-lab": {
    slug: "packaging-lab",
    title: "Tactile Packaging Lab",
    subtitle: "Material experimentation across embossing, foil stamping, rigid boxes, and FSC-certified stocks.",
    badge: "Physical Craft",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384421/artsavvy/40.jpg",
    category: "lab",
    blocks: [
      {
        id: "pk1",
        type: "text",
        title: "The Tactile Sensation of Luxury",
        badge: "Materiality",
        content: "Before a customer reads a single word, their fingertips register the weight, texture, and temperature of the unboxing ritual. We engineer structural dielines that create visceral anticipation.",
      },
      {
        id: "pk2",
        type: "grid",
        title: "Finishing Techniques",
        badge: "Print Direction",
        items: [
          { title: "Blind Micro-Embossing", description: "Ultra-sharp 0.2mm relief textures on 400gsm cotton board." },
          { title: "Hot Foil Stamping", description: "Matte gunmetal, champagne gold, and holographic foils." },
          { title: "Magnetic Rigid Dielines", description: "Satisfying snap closures and custom foam inserts." },
        ],
      },
    ],
  },

  typography: {
    slug: "typography",
    title: "Typography & Specimen Foundry",
    subtitle: "Custom logotypes, bespoke variable font cuts, and editorial kerning studies.",
    badge: "Letterform Craft",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384386/artsavvy/11.jpg",
    category: "lab",
    blocks: [
      {
        id: "typ1",
        type: "text",
        title: "Letters are the Atoms of Meaning",
        badge: "Editorial",
        content: "We sculpt bespoke display letterforms that cannot be bought off the shelf. Every curve, bracket, and terminal is calibrated for maximum memorability.",
      },
    ],
  },

  "3d-motion": {
    slug: "3d-motion",
    title: "3D Motion & Spatial CGI",
    subtitle: "High-fidelity product visualizers, spatial simulations, and launch films.",
    badge: "Spatial Simulation",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384387/artsavvy/12.jpg",
    category: "lab",
    blocks: [
      {
        id: "m3d1",
        type: "grid",
        title: "Spatial Pipelines",
        badge: "Render Engine",
        items: [
          { title: "Octane / Redshift Lighting", description: "Photorealistic raytraced studio light setups." },
          { title: "Soft-Body Physics", description: "Dynamic cloth, liquid, and glass simulations." },
          { title: "Realtime WebGL Models", description: "Optimized 60 FPS GLTF 3D models for the browser." },
        ],
      },
    ],
  },

  clients: {
    slug: "clients",
    title: "Client Roster & Partnerships",
    subtitle: "Collaborating with visionary founders, creative directors, and industry disruptors globally.",
    badge: "Partners",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384388/artsavvy/13.jpg",
    category: "studio",
    blocks: [
      {
        id: "cl1",
        type: "grid",
        title: "Notable Collaborators",
        badge: "Roster",
        items: [
          { title: "Verdelle Organics", subtitle: "Botanical Skin Wellness", tag: "Identity + Web" },
          { title: "Apex EV", subtitle: "Autonomous Performance", tag: "Digital Flagship" },
          { title: "Lumina Labs", subtitle: "Machine Intelligence", tag: "Brand Strategy" },
          { title: "Willow & Whisk", subtitle: "Artisanal Gastronomy", tag: "Packaging" },
        ],
      },
    ],
  },

  "process-manifesto": {
    slug: "process-manifesto",
    title: "The 7-Stage Process Manifesto",
    subtitle: "A methodical framework designed to eliminate guesswork and guarantee excellence.",
    badge: "Methodology",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384389/artsavvy/14.jpg",
    category: "studio",
    blocks: [
      {
        id: "pm1",
        type: "timeline",
        title: "From Discovery to World-Class Launch",
        badge: "Pipeline",
        items: [
          { title: "Stage 01: Strategic Immersion", description: "Competitive landscape analysis, category positioning, and core narrative architecture." },
          { title: "Stage 02: Mood & Visual Trajectories", description: "3 distinct creative directions establishing typography, textures, and tone." },
          { title: "Stage 03: Identity Sculpture", description: "Refining the chosen route down to logomarks, glyphs, and lockups." },
          { title: "Stage 04: Kinetic Interactive Prototyping", description: "High-fidelity interactive code prototypes with real motion physics." },
          { title: "Stage 05: Production & Engineering", description: "Building the clean Next.js stack with zero template bloat." },
          { title: "Stage 06: Quality Assurance & Perf Audit", description: "Sub-second load times, 100/100 Lighthouse performance, and multi-device QA." },
          { title: "Stage 07: Global Deployment & Scale", description: "Seamless launch, DNS configuration, and brand asset delivery." },
        ],
      },
    ],
  },

  strategy: {
    slug: "strategy",
    title: "Brand Strategy & Positioning",
    subtitle: "Architecting category dominance through clarity, contrast, and conviction.",
    badge: "Strategic Core",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384391/artsavvy/15.jpg",
    category: "services",
    blocks: [
      {
        id: "stg1",
        type: "text",
        title: "Distinct or Extinct",
        badge: "Positioning",
        content: "A great design without strategy is just expensive decoration. We unearth the authentic friction in your market that allows your brand to claim uncontested ground.",
      },
    ],
  },

  careers: {
    slug: "careers",
    title: "Careers & Creative Fellowships",
    subtitle: "We are always seeking exceptional designers, creative coders, and writers.",
    badge: "Join Us",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384392/artsavvy/16.jpg",
    category: "studio",
    blocks: [
      {
        id: "car1",
        type: "grid",
        title: "Open Roles",
        badge: "Opportunities",
        items: [
          { title: "Senior Visual Designer", subtitle: "Remote / Full-Time", description: "Mastery in typography systems, Figma design tokens, and luxury brand architecture." },
          { title: "Creative Frontend Engineer", subtitle: "Remote / Full-Time", description: "Deep expertise in Next.js, Framer Motion, GSAP, and WebGL." },
          { title: "3D Motion Artist", subtitle: "Contract / Project-Based", description: "Cinema 4D / Houdini wizard specializing in product renders and simulations." },
        ],
      },
    ],
  },

  collaborations: {
    slug: "collaborations",
    title: "Special Collaborations & Drops",
    subtitle: "Limited edition physical artifacts, artist editions, and studio merchandise.",
    badge: "Limited Edition",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384393/artsavvy/17.jpg",
    category: "lab",
    blocks: [
      {
        id: "col1",
        type: "grid",
        title: "Exclusive Releases",
        badge: "Editions",
        items: [
          { title: "Edition 01: Typographic Silk Scarf", description: "100% Japanese mulberry silk featuring studio glyph patterns. Limited to 50 pieces." },
          { title: "Edition 02: Matte Ceramic Mug", description: "Hand-thrown stoneware with blind-stamped brand seal." },
        ],
      },
    ],
  },

  sustainability: {
    slug: "sustainability",
    title: "Sustainability & Material Ethics",
    subtitle: "Our commitment to 100% recyclable, plastic-free packaging and carbon-neutral digital hosting.",
    badge: "Eco Ethics",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384394/artsavvy/18.jpg",
    category: "resources",
    blocks: [
      {
        id: "sus1",
        type: "grid",
        title: "Sustainable Standards",
        badge: "Commitment",
        items: [
          { title: "FSC-Certified Papers", description: "100% post-consumer waste cotton boards and vegetable-based soy inks." },
          { title: "Zero Micro-Plastics", description: "Water-based biodegradable coatings replacing plastic laminations." },
          { title: "Green Digital Servers", description: "100% renewable energy powered cloud CDN infrastructure." },
        ],
      },
    ],
  },

  "press-kit": {
    slug: "press-kit",
    title: "Press Kit & Media Assets",
    subtitle: "High-resolution studio photography, vector logos, and founder bios for publication.",
    badge: "Media Assets",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384395/artsavvy/19.jpg",
    category: "resources",
    blocks: [
      {
        id: "pr1",
        type: "grid",
        title: "Downloadable Packages",
        badge: "Assets",
        items: [
          { title: "Brand Identity Vector Kit", description: "SVG and EPS logos in dark and light variations." },
          { title: "Studio Executive Headshots", description: "300 DPI high-resolution founder portraits." },
          { title: "Case Study High-Res Renders", description: "Print-ready TIFF packaging and web visualizers." },
        ],
      },
    ],
  },

  pricing: {
    slug: "pricing",
    title: "Transparent Engagement Tiers",
    subtitle: "Clear project scopes and retainer structures tailored for ambitious brands.",
    badge: "Investment",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384405/artsavvy/27.jpg",
    category: "services",
    blocks: [
      {
        id: "prc1",
        type: "grid",
        title: "Engagement Models",
        badge: "Tiers",
        items: [
          {
            title: "Sprint 01: Core Identity Framework",
            subtitle: "4-Week Intensive",
            value: "From $12K",
            description: "For startups seeking instant market distinction.",
            details: ["Brand Positioning", "Logo & Typography System", "Color System & Brand Book", "Social Launch Kit"],
          },
          {
            title: "Sprint 02: Full Digital Flagship",
            subtitle: "8-Week Comprehensive",
            value: "From $24K",
            description: "For established leaders scaling category authority.",
            details: ["Complete Identity System", "Next.js Kinetic Website", "Custom 3D Animations", "Packaging Direction"],
          },
          {
            title: "Sprint 03: Executive Creative Retainer",
            subtitle: "Ongoing Monthly Direction",
            value: "From $8K/mo",
            description: "Continuous creative direction and asset rollout.",
            details: ["Weekly Sprint Deliverables", "Dedicated Art Director", "Priority Slack Access", "Packaging & Campaign Support"],
          },
        ],
      },
      {
        id: "prc2",
        type: "cta",
        title: "Need a custom enterprise scope?",
        subtitle: "We craft custom proposals for multi-brand holding groups and global rollouts.",
        ctaText: "Request Custom Proposal",
        ctaLink: "/p/contact-booking",
      },
    ],
  },

  faq: {
    slug: "faq",
    title: "Client Knowledgebase & FAQ",
    subtitle: "Transparent answers regarding our collaboration process, IP ownership, and deliverables.",
    badge: "Knowledgebase",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384406/artsavvy/28.jpg",
    category: "resources",
    blocks: [
      {
        id: "fq1",
        type: "faq",
        title: "Frequently Addressed Inquiries",
        badge: "Clarity",
        items: [
          {
            title: "Who owns the intellectual property and source code?",
            description: "You do. Upon project completion and final settlement, 100% of all IP, copyright, vector files, and Next.js repository code belong entirely to your company.",
          },
          {
            title: "Do you work with clients across different time zones?",
            description: "Yes, our studio operates globally with streamlined async communication and scheduled video alignment sprints.",
          },
          {
            title: "How many revision cycles are included?",
            description: "We work collaboratively in sprints with continuous feedback checkpoints rather than rigid numbered cycles.",
          },
        ],
      },
    ],
  },

  "contact-booking": {
    slug: "contact-booking",
    title: "Book a Strategy Consultation",
    subtitle: "Schedule a private 30-minute introductory discovery session with our founding directors.",
    badge: "Direct Access",
    coverImage: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384407/artsavvy/29.jpg",
    category: "studio",
    blocks: [
      {
        id: "cb1",
        type: "text",
        title: "Let's Co-Create Your Brand's Future",
        badge: "Consultation",
        content: "Whether initializing a new category venture or elevating an established prestige name, we welcome ambitious inquiries.",
      },
      {
        id: "cb2",
        type: "grid",
        title: "Direct Channels",
        badge: "Connect",
        items: [
          { title: "Direct Email", subtitle: "inquiry@studio.com", description: "Average response time: under 4 hours." },
          { title: "Studio Location", subtitle: "New York • Zurich • Tokyo", description: "Global presence with physical and digital salons." },
          { title: "Encrypted Telegram", subtitle: "@studio_direct", description: "For urgent press and executive scheduling." },
        ],
      },
    ],
  },
};
