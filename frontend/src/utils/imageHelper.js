const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Normalizes and formats an image URL for display in the frontend.
 * - Handles string URLs and image objects ({ url: ... })
 * - Handles full external URLs (http/https/data)
 * - Prepends the API base URL for self-hosted backend uploads (/uploads/workspaces/...)
 */
export const getImageUrl = (
  image,
  fallback = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
) => {
  if (!image) return fallback;

  const url = typeof image === "string" ? image : image.url;
  if (!url || typeof url !== "string") return fallback;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // Self-hosted relative uploads: /uploads/workspaces/xyz.webp
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

