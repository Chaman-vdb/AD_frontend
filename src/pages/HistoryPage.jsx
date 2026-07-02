import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Search,
} from 'lucide-react';
import HistoryPageShell from '../components/HistoryPageShell.jsx';
import { apiFetch } from '../lib/api.js';
import {
    MODE_META,
    DEFAULT_MODE_META,
    formatRelativeTime,
    formatRunDuration,
    requestContext,
    rowSearchText,
    runStatusRibbon,
} from '../lib/historyMeta.js';

const PAGE_SIZE = 25;

function statusPillClass(status) {
    if (status === 'completed') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    if (status === 'failed') return 'bg-red-50 text-red-700 ring-red-600/20';
    if (status === 'running') return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    return 'bg-slate-100 text-slate-600 ring-slate-500/10';
}

function HistoryPage() {
    const navigate = useNavigate();
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        let active = true;
        setLoading(true);
        apiFetch('/api/history?limit=200')
            .then((res) => (res.ok ? res.json() : []))
            .then((rows) => {
                if (!active) return;
                setRuns(Array.isArray(rows) ? rows : []);
            })
            .catch(() => active && setRuns([]))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return runs;
        return runs.filter((r) => rowSearchText(r).includes(q));
    }, [runs, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    useEffect(() => { setPage(1); }, [searchQuery]);
    useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    const openRun = useCallback((id) => navigate(`/history/${id}`), [navigate]);

    return (
        <HistoryPageShell
            title="Run history"
            subtitle={loading ? 'Loading…' : `${filtered.length} workflow${filtered.length === 1 ? '' : 's'}`}
            actions={(
                <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input
                        type="search"
                        className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        placeholder="Search…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}
        >
            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="size-6 text-slate-400 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-lg border border-slate-200">
                    <Clock className="size-8 text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-slate-700">{runs.length === 0 ? 'No runs yet' : 'No results'}</p>
                    <p className="text-xs text-slate-500 mt-1">Workflows from the dashboard appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-2.5 font-medium w-[140px]">Type</th>
                                    <th className="px-4 py-2.5 font-medium">Summary</th>
                                    <th className="px-4 py-2.5 font-medium w-[100px]">When</th>
                                    <th className="px-4 py-2.5 font-medium w-[72px]">Time</th>
                                    <th className="px-4 py-2.5 font-medium w-[100px]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.map((run) => {
                                    const meta = MODE_META[run.mode] || DEFAULT_MODE_META;
                                    const Ribbon = runStatusRibbon(run.status);
                                    const dur = formatRunDuration(run);
                                    const ctx = requestContext(run.mode, run.request);
                                    const summary = run.resultMessage || ctx || run.label || '—';

                                    return (
                                        <tr
                                            key={run.id}
                                            onClick={() => openRun(run.id)}
                                            className="group cursor-pointer hover:bg-slate-50/90 transition-colors"
                                        >
                                            <td className="px-4 py-2.5">
                                                <span className="text-sm font-medium text-slate-900">{meta.tag}</span>
                                            </td>
                                            <td className="px-4 py-2.5 max-w-0">
                                                <p className="text-sm text-slate-600 truncate" title={summary}>{summary}</p>
                                                {(run.userEmail || run.label) && (
                                                    <p className="text-xs text-slate-400 truncate mt-0.5" title={run.userEmail || run.label}>
                                                        {run.userEmail || run.label}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-slate-500 whitespace-nowrap tabular-nums">
                                                {formatRelativeTime(run.startedAt)}
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-slate-600 whitespace-nowrap tabular-nums">
                                                {dur || '—'}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusPillClass(run.status)}`}>
                                                    <span className={`size-1.5 rounded-full ${Ribbon.dot} ${Ribbon.pulse ? 'animate-pulse' : ''}`} />
                                                    {Ribbon.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 text-sm text-slate-600">
                            <span className="text-xs text-slate-500">
                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <ChevronLeft className="size-3.5" />
                                    Prev
                                </button>
                                <span className="px-2 text-xs tabular-nums text-slate-500">{page} / {totalPages}</span>
                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    Next
                                    <ChevronRight className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </HistoryPageShell>
    );
}

export default HistoryPage;
