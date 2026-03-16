const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(path) {
    if (!API_BASE_URL) return path;
    return `${API_BASE_URL}${path}`;
}

export async function apiFetch(path, init = {}) {
    const response = await fetch(apiUrl(path), {
        ...init,
        credentials: 'include',
    });
    return response;
}

export async function apiJson(path, init = {}) {
    const response = await apiFetch(path, init);
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Request failed (${response.status})`);
    }
    return response.json();
}

