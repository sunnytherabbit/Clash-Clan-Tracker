const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function api_fetch(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body && { "Content-Type": "application/json" }),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.message || data?.error || `HTTP ${response.status}`;
        throw new Error(message);
    }

    return data;
}
