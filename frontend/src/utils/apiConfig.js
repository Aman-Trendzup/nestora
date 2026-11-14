/**
 * Resolves the API base URL.
 * In development (e.g. `npm run dev` with Vite), it defaults to `http://localhost:5000`
 * unless explicitly overridden by `VITE_API_URL`.
 * In production (e.g. deployed on Vercel), requests default to same-origin `""` (relative paths)
 * so that /api requests automatically route through Vercel's rewrite rules to the backend service.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
    ? "http://localhost:5000"
    : "";

export default API_BASE_URL;
