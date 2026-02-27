import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string || "/api";

/** Typed response wrapper */
interface ApiResponse<T = unknown> {
    data: T;
    error?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
    method: string,
    path: string,
    body?: unknown
): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        // Throw the raw error object so callers can access .detail array
        throw err;
    }

    // 204 No Content
    if (res.status === 204) {
        return { data: undefined as T };
    }

    const data = await res.json();
    return { data: data as T };
}

export const api = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
    patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
};
