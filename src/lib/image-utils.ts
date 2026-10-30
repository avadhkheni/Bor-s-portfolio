/**
 * Optimizes image URLs for production performance.
 * For Cloudinary URLs, automatically injects:
 * - f_auto (delivers modern AVIF/WebP depending on user browser)
 * - q_auto (optimizes compression without visual loss)
 * - optional width bounding for responsive rendering
 */
export function getOptimizedImageUrl(url?: string | null, width?: number): string {
  if (!url || typeof url !== "string") {
    return "/placeholder.svg";
  }

  const trimmed = url.trim();
  if (!trimmed) return "/placeholder.svg";

  // Check if it's a Cloudinary URL
  if (trimmed.includes("res.cloudinary.com") && trimmed.includes("/image/upload/")) {
    // Avoid double-transformation if f_auto or q_auto already present
    if (trimmed.includes("f_auto") || trimmed.includes("q_auto")) {
      return trimmed;
    }

    const transformParams = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
    return trimmed.replace("/image/upload/", `/image/upload/${transformParams}/`);
  }

  return trimmed;
}

