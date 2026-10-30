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

export const ALL_PROJECTS: Record<string, ProjectDetail> = {
  "willow-whisk": {
    id: "willow-whisk",
    title: "WILLOW & WHISK — Artisan Bakery & Café",
    category: "Packaging & Brand Identity",
    year: "2026",
    url: "willow-whisk.cafe",
    imageSrc: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384405/artsavvy/27.jpg",
    secondaryImages: [
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384406/artsavvy/28.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384407/artsavvy/29.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384410/artsavvy/30.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384411/artsavvy/31.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384412/artsavvy/32.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384414/artsavvy/34.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384414/artsavvy/35.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384416/artsavvy/36.jpg",
    ],
    tag: "Bakery & Cafe",
    description: "A Jaipur-based artisan bakery and café brand identity system. Featuring handcrafted pastry boxes, specialty coffee packaging, architectural outdoor signage, and a cohesive digital presence.",
    challenge: "Developing a cozy, inviting brand presence that appeals to both local coffee lovers and tourists seeking specialty roasted coffee and artisanal sourdough.",
    solution: "Crafted warm earth-tone typography, hand-drawn character illustrations, tactile cardboard packaging, and high-impact subway campaign graphics.",
    client: "Willow & Whisk Bakery Jaipur",
    role: "Lead Packaging & Brand Identity Designer",
    tools: ["Brand Strategy", "Packaging Design", "Signage Art Direction", "Digital Systems"],
  },

  "verdelle": {
    id: "verdelle",
    title: "VERDELLE — Botanical Hair & Skincare",
    category: "Packaging & Beauty Identity",
    year: "2026",
    url: "verdelle-beauty.store",
    imageSrc: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384399/artsavvy/22.jpg",
    secondaryImages: [
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384400/artsavvy/23.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384401/artsavvy/24.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384403/artsavvy/25.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384404/artsavvy/26.jpg",
    ],
    tag: "Skincare",
    description: "Ethical botanical hair care and skin formulation brand identity centered on 100% raw Honduran Batana oil and natural ingredient transparency.",
    challenge: "Differentiating an organic ethical beauty brand with elegant, minimalist packaging that highlights natural ingredients.",
    solution: "Emphasized authentic skin model photography, warm terracotta stationery, frosted glass cosmetic jars, and botanical line-art tube packaging.",
    client: "Verdelle Organics",
    role: "Creative Direction & Cosmetic Packaging",
    tools: ["Cosmetic Packaging", "Photography Direction", "Brand Identity"],
  },

  "natura": {
    id: "natura",
    title: "NATURA — Organic Snack & Beverage",
    category: "Packaging & Product Identity",
    year: "2025",
    url: "natura-snack.com",
    imageSrc: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384394/artsavvy/18.jpg",
    secondaryImages: [
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384395/artsavvy/19.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384397/artsavvy/20.jpg",
      "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384398/artsavvy/21.jpg",
    ],
    tag: "Organic Snack",
    description: "A vibrant organic snack and takeaway beverage identity system with playfulness at its core. 'Snack Smart, Live Bright.'",
    challenge: "Creating a high-energy, cheerful snack brand that communicates organic health benefits without feeling dry or overly clinical.",
    solution: "Formulated vibrant red display lettering, playful rainbow pattern collateral, and sustainable takeaway cup designs.",
    client: "Natura Foods Ltd",
    role: "Brand Identity & Packaging Specialist",
    tools: ["Packaging", "Illustration", "Brand Collateral"],
  },


  "mr-mug": {
    id: "mr-mug",
    title: "MR. MUG — Vintage Character Café",
    category: "Brand Mascot & Signage Design",
    year: "2025",
    url: "mr-mug.coffee",
    imageSrc: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384412/artsavvy/33.jpg",
    secondaryImages: ["https://res.cloudinary.com/dh4rilktz/image/upload/v1793384412/artsavvy/33.jpg"],
    tag: "Mascot & Cafe",
    description: "Nostalgic retro mascot branding and wall signage for a specialty espresso bar.",
    challenge: "Designing a memorable retro brand mascot that stands out on street corner signage.",
    solution: "Hand-drawn vintage mug character with bold 1970s typographic layout.",
    client: "Mr. Mug Coffee Co.",
    role: "Illustration & Brand Designer",
    tools: ["Vector Illustration", "Signage", "Print Design"],
  },

  "r1-7": {
    id: "r1-7",
    title: "CREATIVE — Design Showcase",
    category: "Interactive & Brand System",
    year: "2026",
    url: "creative-showcase.design",
    imageSrc: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384428/artsavvy/image.png",
    secondaryImages: ["https://res.cloudinary.com/dh4rilktz/image/upload/v1793384428/artsavvy/image.png"],
    tag: "Showcase",
    description: "An ultra-modern visual portfolio showcase featuring high-contrast typography and interactive layout previews.",
    challenge: "Presenting multiple visual projects seamlessly without layout degradation.",
    solution: "Designed custom web layouts, full-resolution lightboxes, and smooth marquee interactions.",
    client: "Creative Showcase Studio",
    role: "Lead Interactive Designer",
    tools: ["Next.js", "Framer Motion", "Tailwind CSS"],
  },

  "r2-7": {
    id: "r2-7",
    title: "LUMINA — Digital Experience",
    category: "3D Motion & Spatial UI",
    year: "2026",
    url: "lumina-experience.co",
    imageSrc: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384472/artsavvy/WhatsApp_Image_2026-08-21_at_10_29_30_PM.jpg",
    secondaryImages: ["https://res.cloudinary.com/dh4rilktz/image/upload/v1793384472/artsavvy/WhatsApp_Image_2026-08-21_at_10_29_30_PM.jpg"],
    tag: "Digital Art",
    description: "A spatial visual identity and 3D digital experience platform for luxury fashion and architectural installation showcases.",
    challenge: "Balancing heavy 3D visual assets with low latency page transitions.",
    solution: "Implemented progressive WebGL asset streaming and dynamic responsive layout containers.",
    client: "Lumina Labs",
    role: "Spatial Designer & Art Director",
    tools: ["Three.js", "React", "GSAP"],
  },
};
