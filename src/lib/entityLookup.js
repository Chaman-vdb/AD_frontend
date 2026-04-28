import { apiFetch } from './api.js';

/** @param {string|number} id */
export async function fetchOrgById(id) {
    const idStr = String(id ?? '').trim();
    if (!/^\d+$/.test(idStr)) return null;
    try {
        const r = await apiFetch(`/api/data/orgs/${idStr}`);
        if (!r.ok) return null;
        const d = await r.json();
        const name = d?.name;
        return typeof name === 'string' && name.trim() ? name.trim() : null;
    } catch {
        return null;
    }
}

/** @param {string|number} id */
export async function fetchCompanyById(id) {
    const idStr = String(id ?? '').trim();
    if (!/^\d+$/.test(idStr)) return null;
    try {
        const r = await apiFetch(`/api/data/companies/${idStr}`);
        if (!r.ok) return null;
        const d = await r.json();
        const name = d?.name;
        return typeof name === 'string' && name.trim() ? name.trim() : null;
    } catch {
        return null;
    }
}

/** @param {string|number} id */
export async function fetchUserById(id) {
    const idStr = String(id ?? '').trim();
    if (!/^\d+$/.test(idStr)) return null;
    try {
        const r = await apiFetch(`/api/data/users/${idStr}`);
        if (!r.ok) return null;
        const d = await r.json();
        const u = d?.username;
        const e = d?.email;
        const fromUser = typeof u === 'string' && u.trim() ? u.trim() : null;
        const fromEmail = typeof e === 'string' && e.trim() ? e.trim() : null;
        return fromUser || fromEmail;
    } catch {
        return null;
    }
}

/**
 * @param {string} rawCommaSeparated
 * @returns {Promise<{ id: string, name: string | null }[]>}
 */
export async function fetchCompanyNamesForIds(rawCommaSeparated) {
    const ids = String(rawCommaSeparated || '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => /^\d+$/.test(s));
    const unique = [...new Set(ids)];
    const results = await Promise.all(
        unique.map(async (id) => ({
            id,
            name: await fetchCompanyById(id),
        })),
    );
    return results;
}
