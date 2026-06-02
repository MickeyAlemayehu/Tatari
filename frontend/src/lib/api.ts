import { clearSession, getStoredToken } from "./auth-storage";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]> | undefined;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const payload = typeof body === "object" && body !== null ? body : { message: String(body) };
    const fallback = defaultMessageForStatus(response.status);
    const rawMessage = (payload as { message?: string }).message;
    // If we somehow got a non-JSON body (e.g. proxy/CDN HTML error page), don't surface raw
    // HTML to the user — fall back to a generic, status-appropriate message.
    const looksLikeHtml = !isJson && typeof rawMessage === "string" && /<\/?[a-z][\s\S]*>/i.test(rawMessage);
    const message = looksLikeHtml || !rawMessage ? fallback : rawMessage;

    if (response.status === 401) {
      clearSession();
    }

    throw new ApiError(
      message,
      response.status,
      (payload as { errors?: Record<string, string[]> }).errors
    );
  }

  return body as T;
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 401:
      return "You need to sign in to continue.";
    case 403:
      return "You are not authorized to perform this action.";
    case 404:
      return "Resource not found.";
    case 422:
      return "The submitted data is invalid.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
    case 502:
    case 503:
      return "The server encountered an error. Please try again.";
    default:
      return `Request failed with status ${status}`;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (!requestHeaders.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getStoredToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  return parseResponse<T>(response);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) => {
    const requestOptions: RequestOptions = { ...options, method: "POST" };
    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }
    return apiRequest<T>(path, requestOptions);
  },

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => {
    const requestOptions: RequestOptions = { ...options, method: "PATCH" };
    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }
    return apiRequest<T>(path, requestOptions);
  },

  put: <T>(path: string, body?: unknown, options?: RequestOptions) => {
    const requestOptions: RequestOptions = { ...options, method: "PUT" };
    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }
    return apiRequest<T>(path, requestOptions);
  },

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),

  download: async (
    path: string,
    options: RequestOptions = {}
  ): Promise<{ blob: Blob; filename: string }> => {
    const { auth = true, headers, ...rest } = options;
    const requestHeaders = new Headers(headers);
    if (!requestHeaders.has("Accept")) requestHeaders.set("Accept", "*/*");
    if (auth) {
      const token = getStoredToken();
      if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      method: "GET",
      headers: requestHeaders,
    });

    if (!response.ok) {
      let message = defaultMessageForStatus(response.status);
      try {
        const body = await response.clone().json();
        if (body && typeof body.message === "string") message = body.message;
      } catch {
        // non-JSON body — keep the status-derived fallback message
      }
      if (response.status === 401) clearSession();
      throw new ApiError(message, response.status);
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    const filename = match?.[1] ? decodeURIComponent(match[1]) : "download";

    return { blob, filename };
  },
};
