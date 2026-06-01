const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  form?: URLSearchParams;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function formatApiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return fallback;

  const detail = "detail" in data ? (data as { detail: unknown }).detail : data;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return null;

        const errorItem = item as { msg?: unknown; loc?: unknown };
        const message = typeof errorItem.msg === "string" ? errorItem.msg : null;
        if (!message) return null;

        const location = Array.isArray(errorItem.loc)
          ? errorItem.loc.filter((part) => part !== "body").join(".")
          : null;
        return location ? `${location}: ${message}` : message;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) return messages.join("; ");
  }

  if (detail && typeof detail === "object" && "message" in detail && typeof (detail as { message?: unknown }).message === "string") {
    return (detail as { message: string }).message;
  }

  return fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.form) {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    init.body = options.form.toString();
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, init);
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = formatApiErrorMessage(data, `Request failed with status ${response.status}`);
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
