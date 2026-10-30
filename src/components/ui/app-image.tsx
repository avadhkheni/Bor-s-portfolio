"use client";

import * as React from "react";
import Image, { ImageProps } from "next/image";
import { getOptimizedImageUrl } from "@/lib/image-utils";

export interface AppImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
}

export function AppImage({
  src,
  alt = "",
  fallbackSrc = "/placeholder.svg",
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill = true,
  priority = false,
  ...props
}: AppImageProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(() => {
    return getOptimizedImageUrl(src) || fallbackSrc;
  });
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(getOptimizedImageUrl(src) || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <Image
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
      className={`object-cover transition-opacity duration-300 ${className}`}
      {...props}
    />
  );
}
