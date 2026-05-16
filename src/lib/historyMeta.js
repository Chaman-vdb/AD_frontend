import {
    Building2,
    Building,
    UserPlus,
    FileCode,
    CircleDot,
    Package,
    UsersRound,
    UserCog,
    User,
    Check,
    X,
    Loader2,
    Clock,
    Pause,
} from 'lucide-react';

export const MODE_META = {
    org: { icon: Building2, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', tag: 'Org copy' },
    company: { icon: Building, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', tag: 'Company copy' },
    user: { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', tag: 'Create users' },
    script: { icon: FileCode, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', tag: 'Script' },
    'inventory-permissions': { icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', tag: 'Inventory' },
    'bulk-users-sheet': { icon: UsersRound, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', tag: 'Bulk users' },
    'server-admin': { icon: UserCog, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', tag: 'Server admin' },
    'single-user-http': { icon: User, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', tag: 'User (HTTP)' },
};

export const DEFAULT_MODE_META = { icon: CircleDot, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', tag: 'Task' };

export const STATUS_BADGE = {
    completed: { variant: 'success', icon: Check, label: 'Completed' },
    failed: { variant: 'destructive', icon: X, label: 'Failed' },
    running: { variant: 'warning', icon: Loader2, label: 'Running' },
    pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
    paused: { variant: 'secondary', icon: Pause, label: 'Paused' },
};

/** Dot + label for history list / detail status chips */
export function runStatusRibbon(status) {
    const s = status || 'pending';
    const map = {
        completed: { dot: 'bg-emerald-500', label: 'Completed' },
        failed: { dot: 'bg-red-500', label: 'Failed' },
        running: { dot: 'bg-blue-500', label: 'In progress', pulse: true },
        paused: { dot: 'bg-amber-500', label: 'Paused' },
        pending: { dot: 'bg-slate-300', label: 'Pending' },
    };
    return map[s] || map.pending;
}

export function stepStatusRibbon(status) {
    const s = status || 'pending';
    const map = {
        completed: { dot: 'bg-emerald-500', label: 'Completed' },
        failed: { dot: 'bg-red-500', label: 'Failed' },
        running: { dot: 'bg-blue-500', label: 'Running', pulse: true },
        pending: { dot: 'bg-slate-200', label: 'Pending' },
    };
    return map[s] || map.pending;
}


export function formatHistoryDate(ts) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '—';
    return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

/** Long prose date like "22 January 2025" */
export function formatHistoryDateCalendar(ts) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}


/** Short relative label e.g. "Just now", "3h ago", "Apr 17" */
export function formatRelativeTime(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    const t = d.getTime();
    if (Number.isNaN(t)) return '—';
    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1000);
    if (sec < 45) return 'Just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    if (sec < 172800) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDurationMs(ms) {
    if (ms == null || Number.isNaN(ms) || ms < 0) return null;
    const sec = Math.round(ms / 1000);
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m < 60) return `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}

export function formatDuration(startedAt, endedAt) {
    if (!startedAt) return null;
    const a = new Date(startedAt).getTime();
    const b = endedAt ? new Date(endedAt).getTime() : Date.now();
    if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
    return formatDurationMs(b - a);
}

export function formatRunDuration(run) {
    if (run?.durationMs != null) return formatDurationMs(run.durationMs);
    return formatDuration(run?.startedAt, run?.endedAt);
}

export function stepSummary(steps) {
    if (!Array.isArray(steps) || steps.length === 0) return null;
    const total = steps.length;
    const completed = steps.filter((s) => s.status === 'completed').length;
    const failed = steps.filter((s) => s.status === 'failed').length;
    return { total, completed, failed };
}

/** One-line context from stored request (no secrets). */
export function requestContext(mode, request) {
    if (!request || typeof request !== 'object') return null;
    const r = request;
    if (mode === 'user') {
        const parts = [];
        if (r.companyId) parts.push(`Company #${r.companyId}`);
        if (r.email) parts.push(String(r.email));
        if (r.numberOfUsers != null) parts.push(`${r.numberOfUsers} user(s)`);
        return parts.length ? parts.join(' · ') : null;
    }
    if (mode === 'company') {
        const parts = [];
        if (r.targetOrgId) parts.push(`Org #${r.targetOrgId}`);
        if (r.sourceCompanyId) parts.push(`from company #${r.sourceCompanyId}`);
        return parts.length ? parts.join(' · ') : null;
    }
    if (mode === 'org') {
        if (r.sourceOrgId) return `Source org #${r.sourceOrgId}${r.newOrgName ? ` → ${r.newOrgName}` : ''}`;
        return null;
    }
    if (mode === 'inventory-permissions') {
        if (r.clientCompanyId) return `Client #${r.clientCompanyId}`;
        return null;
    }
    if (mode === 'script' && r.script) return `${r.script}`;
    if (mode === 'bulk-users-sheet') {
        if (r.mode === 'json') return 'JSON / prepared rows';
        if (r.mode === 'multipart') return 'Spreadsheet upload';
        return null;
    }
    if (mode === 'server-admin') {
        const parts = [];
        if (r.organizationId != null) parts.push(`Org #${r.organizationId}`);
        if (r.companyId != null) parts.push(`Company #${r.companyId}`);
        if (r.email) parts.push(String(r.email));
        return parts.length ? parts.join(' · ') : null;
    }
    if (mode === 'single-user-http') {
        const parts = [];
        if (r.username) parts.push(String(r.username));
        if (r.organizationId != null) parts.push(`Org #${r.organizationId}`);
        if (r.companyId != null) parts.push(`Co #${r.companyId}`);
        if (r.email) parts.push(String(r.email));
        if (r.verifyEmail) parts.push('verify email');
        return parts.length ? parts.join(' · ') : null;
    }
    return null;
}

export function rowSearchText(r) {
    const req = r.request && typeof r.request === 'object' ? r.request : {};
    const flat = [
        r.label,
        r.user,
        r.userEmail,
        r.mode,
        r.resultMessage,
        r.activeEnv,
        r.id,
        ...Object.values(req).map((v) => (typeof v === 'object' ? JSON.stringify(v) : v)),
    ].filter(Boolean).map(String);
    return flat.join(' ').toLowerCase();
}

export function humanizeRequestKey(key) {
    return String(key)
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}
