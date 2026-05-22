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
    const message =
      (payload as { message?: string }).message ??
      `Request failed with status ${response.status}`;

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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

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

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
