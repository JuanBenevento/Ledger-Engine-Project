import createClient from "openapi-fetch";
import type { paths } from "./types/api";

/**
 * Typed API client generated from OpenAPI spec.
 *
 * Uses httpOnly cookies for authentication (credentials: "include").
 * Base URL configured via NEXT_PUBLIC_API_URL environment variable.
 */
const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
