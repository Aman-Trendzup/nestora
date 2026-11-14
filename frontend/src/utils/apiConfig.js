/**
 * Resolves the API base URL.
 * In development (e.g. `npm run dev` with Vite), it defaults to `http://localhost:5000`.
 * In production (when deployed or built for production), it ALWAYS defaults to `""` (relative paths)
 * so that `/api/*` requests route through Vercel's rewrite rules to the backend service.
 * Even if a `.env` file with `localhost` exists, production ignores `localhost` to avoid ERR_CONNECTION_REFUSED.
 */
const rawUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = import.meta.env.PROD
  ? (rawUrl && !rawUrl.includes("localhost") && !rawUrl.includes("127.0.0.1") ? rawUrl : "")
  : (rawUrl || "http://localhost:5000");

export default API_BASE_URL;

