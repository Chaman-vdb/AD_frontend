import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    Loader2,
    Search,
    Download,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { apiFetch } from '../lib/api.js';
import {
    MODE_META,
    DEFAULT_MODE_META,
    formatHistoryDateCalendar,
    formatRelativeTime,
    formatRunDuration,
    formatDurationMs,
    requestContext,
    rowSearchText,
    runStatusRibbon,
    stepStatusRibbon,
} from '../lib/historyMeta.js';

function HistoryPage() {
    const navigate = useNavigate();
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        apiFetch('/api/history?limit=200')
            .then((res) => (res.ok ? res.json() : []))
            .then((rows) => {
                if (!active) return;
                if (Array.isArray(rows)) setRuns(rows);
                else setRuns([]);
            })
            .catch(() => active && setRuns([]))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return runs;
        return runs.filter((r) => rowSearchText(r).includes(q));
    }, [runs, searchQuery]);

    const exportFilteredJson = useCallback(() => {
        if (filtered.length === 0) return;
        setExporting(true);
        try {
            const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            a.href = URL.createObjectURL(blob);
            a.download = `task-history-${stamp}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        } finally {
            setExporting(false);
        }
    }, [filtered]);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
                <div className=" mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
                    <div className="flex items-center gap-12 min-w-0">
                        <Link
                            to="/"
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeft className="size-5 text-slate-600" />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">History</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {loading
                                    ? 'Loading…'
                                    : 'Saved workflows from the dashboard.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                        <div className="relative w-full sm:w-56 md:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input
                                type="search"
                                className="w-full h-10 pl-10 pr-3 text-sm rounded-xl border border-slate-200 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none transition-shadow"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-14">
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="size-8 text-slate-400 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
                        <div className="size-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                            <Clock className="size-7 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-base font-semibold text-slate-800">{runs.length === 0 ? 'No history yet' : 'No matches'}</h2>
                        <p className="text-sm text-slate-500 max-w-md mt-1">
                            {runs.length === 0
                                ? 'Start a workflow from the dashboard — it appears here automatically.'
                                : 'Try another search keyword.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <button
                            type="button"
                            disabled={filtered.length === 0 || exporting}
                            onClick={exportFilteredJson}
                            className="sm:hidden w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                        >
                            <Download className="size-3.5" />
                            Export JSON
                        </button>
                        <ul className="space-y-6 list-none p-0 m-0">
                            {filtered.map((run) => {
                                const meta = MODE_META[run.mode] || DEFAULT_MODE_META;
                                const Ribbon = runStatusRibbon(run.status);
                                const dur = formatRunDuration(run);
                                const ctx = requestContext(run.mode, run.request);
                                const steps = Array.isArray(run.steps) ? run.steps : [];
                                const Icon = meta.icon;
                                return (
                                    <li key={run.id}>
                                        <Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow transition-shadow overflow-hidden">
                                            <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
                                                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1 min-w-0">
                                                        <div>
                                                            <p className="text-xs text-slate-500">Task Done</p>
                                                            <p className="mt-1 text-sm font-semibold text-slate-900 font-mono break-all">{meta.tag}</p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5 truncate" title={run.label}>{run.label || meta.tag}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Started</p>
                                                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatHistoryDateCalendar(run.startedAt)}</p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">{formatRelativeTime(run.startedAt)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500">{dur ? 'Duration' : 'Outcome'}</p>
                                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                                {dur || (Ribbon.label === 'Completed' ? 'Finished' : Ribbon.label)}
                                                            </p>
                                                            {run.resultMessage ? (
                                                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{run.resultMessage}</p>
                                                            ) : ctx ? (
                                                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 truncate" title={ctx}>{ctx}</p>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 shrink-0 lg:min-w-[8.5rem]">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/history/${run.id}`)}
                                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                                                        >
                                                            View detail
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex flex-wrap items-center gap-2 justify-between pt-4 border-t border-slate-100">
                                                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                                                        <span className={`size-2 rounded-full shrink-0 ${Ribbon.dot} ${Ribbon.pulse ? 'animate-pulse' : ''}`} />
                                                        {Ribbon.label}
                                                    </div>
                                                    {(run.user || run.userEmail) ? (
                                                        <p className="text-[11px] text-slate-400 truncate max-w-full sm:max-w-md">
                                                            {run.userEmail}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>

                                        </Card>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HistoryPage;
