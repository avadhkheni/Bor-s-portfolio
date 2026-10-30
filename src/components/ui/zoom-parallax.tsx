"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { AppImage } from "@/components/ui/app-image";

interface Image {
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  images?: Image[];
}

const defaultParallaxImages: Image[] = [
  { src: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384352/artsavvy/1.jpg", alt: "Brand identity design showcase" },
  { src: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384396/artsavvy/2.jpg", alt: "Minimalist packaging aesthetic" },
  { src: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384409/artsavvy/3.jpg", alt: "High-end product photography" },
  { src: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384420/artsavvy/4.jpg", alt: "Creative directional brand art" },
  { src: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384423/artsavvy/5.jpg", alt: "Custom typography and layout" },
  { src: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384424/artsavvy/6.jpg", alt: "Spatial audio identity mockup" },
  { src: "https://res.cloudinary.com/dh4rilktz/image/upload/v1793384425/artsavvy/7.jpg", alt: "Cyber beverage package composition" },
];

export function ZoomParallax({ images }: ZoomParallaxProps) {
  const displayImages: Image[] = (images && images.length > 0) ? images : defaultParallaxImages;
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  return (
    <div ref={container} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {displayImages.map(({ src, alt }, index) => {
          const scale = scales[index % scales.length];

          return (
            <motion.div
              key={index}
              style={{ scale }}
              className={`absolute top-0 flex h-full w-full items-center justify-center ${
                index === 1
                  ? "[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]"
                  : ""
              } ${
                index === 2
                  ? "[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]"
                  : ""
              } ${
                index === 3
                  ? "[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]"
                  : ""
              } ${
                index === 4
                  ? "[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]"
                  : ""
              } ${
                index === 5
                  ? "[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]"
                  : ""
              } ${
                index === 6
                  ? "[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]"
                  : ""
              } `}
            >
              <div className="relative h-[25vh] w-[25vw] overflow-hidden">
                <AppImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={alt || `Parallax image ${index + 1}`}
                  sizes="(max-width: 768px) 50vw, 35vw"
                  priority={index < 2}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
