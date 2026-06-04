/**
 * Production-grade API Client utility for Next.js to interface with the Express backend.
 * Features automated Authorization headers, credentials for HTTP-only cookies,
 * and token refresh retry interceptors.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/**
 * Perform silent refresh by calling /auth/refresh
 */
const performSilentRefresh = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Important: Include credentials to send/receive HTTP-only refresh cookie
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to refresh session");
      }

      const body = await res.json();
      const newAccessToken = body.data?.accessToken;
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (err) {
      console.warn("Silent refresh failed:", err);
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Universal fetch wrapper with authorization and auto-refresh interceptor
 */
export const apiRequest = async (path: string, options: RequestOptions = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach access token if present
  if (accessToken && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Enforce credentials so cookies (refresh tokens) are sent/received
  options.credentials = "include";
  options.headers = headers;

  let response = await fetch(url, options);

  // If unauthorized, token might have expired. Try refreshing it.
  if (response.status === 401 && !options.skipAuth) {
    console.log("Access token expired (401). Retrying with silent refresh...");
    const newAccessToken = await performSilentRefresh();

    if (newAccessToken) {
      // Retry request with new token
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);
      options.headers = retryHeaders;
      response = await fetch(url, options);
    }
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.errors = data?.errors;
    throw error;
  }

  return data;
};
