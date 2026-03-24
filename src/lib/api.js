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

/**
 * Reads POST /api/bulk-users/run NDJSON stream (keepalive + final result).
 * Falls back to JSON if the server returns a legacy single JSON body.
 */
export async function readNdjsonBulkRunResponse(response) {
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        try {
            const j = JSON.parse(text);
            throw new Error(j.message || text || `Request failed (${response.status})`);
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new Error(text || `Request failed (${response.status})`);
            }
            throw e;
        }
    }
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('ndjson')) {
        return response.json();
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let complete = null;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (!line.trim()) continue;
                let obj;
                try {
                    obj = JSON.parse(line);
                } catch {
                    continue;
                }
                if (obj.type === 'complete') complete = obj.result;
                if (obj.type === 'error') throw new Error(obj.message || 'Bulk run failed');
            }
        }
    } finally {
        reader.releaseLock();
    }
    if (complete == null) {
        throw new Error('Invalid bulk run response (no result)');
    }
    return complete;
}

