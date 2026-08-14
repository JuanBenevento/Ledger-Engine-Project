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

/**
 * Escape-hatch client for endpoints not yet present in the generated OpenAPI spec.
 *
 * Prefer updating openapi.yaml and regenerating api.d.ts when the backend contract is known.
 * The typed {@link api} should be used for all spec-covered endpoints.
 */
export interface UntypedApiClient {
  GET(path: string, init?: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  POST(path: string, init?: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  PUT(path: string, init?: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  DELETE(path: string, init?: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  PATCH(path: string, init?: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
}

export const untypedApi = api as unknown as UntypedApiClient;

export default api;
