import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Database,
    Clock,
    Loader2,
    Search,
    Filter,
    ChevronRight,
    Download,
    HardDrive,
    Server,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { apiFetch } from '../lib/api.js';
import {
    MODE_META,
    DEFAULT_MODE_META,
    STATUS_BADGE,
    MODE_FILTERS,
    STATUS_FILTERS,
    formatHistoryDate,
    formatRelativeTime,
    formatRunDuration,
    requestContext,
    rowSearchText,
    stepSummary,
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
        return () => { active = false; };
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMode, setFilterMode] = useState('all');

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return runs.filter((r) => {
            if (filterStatus !== 'all' && r.status !== filterStatus) return false;
            if (filterMode !== 'all' && r.mode !== filterMode) return false;
            if (q && !rowSearchText(r).includes(q)) return false;
            return true;
        });
    }, [runs, searchQuery, filterStatus, filterMode]);

    const stats = useMemo(() => ({
        total: runs.length,
        completed: runs.filter((r) => r.status === 'completed').length,
        failed: runs.filter((r) => r.status === 'failed').length,
        running: runs.filter((r) => r.status === 'running').length,
        paused: runs.filter((r) => r.status === 'paused').length,
    }), [runs]);

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
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/80 to-white">
            <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
                <Link to="/" className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0" aria-label="Back to app">
                    <ArrowLeft className="size-5 text-slate-600" />
                </Link>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0">
                        <Database className="size-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Task history</h1>
                        <p className="text-xs text-slate-500 truncate">
                            {loading ? 'Loading…' : `${stats.total} saved run${stats.total === 1 ? '' : 's'} · server-backed audit log`}
                        </p>
                    </div>
                </div>
                <div className="flex-1" />
                <button
                    type="button"
                    disabled={filtered.length === 0 || exporting}
                    onClick={exportFilteredJson}
                    className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                    <Download className="size-4" />
                    Export JSON
                </button>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-blue-50/40 px-4 py-3 flex gap-3 items-start shadow-sm">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80 shrink-0">
                        <HardDrive className="size-4 text-blue-600" />
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed min-w-0">
                        <p className="font-semibold text-slate-800">Persisted on the server</p>
                        <p className="mt-0.5 text-slate-600">
                            Runs, request snapshots, steps, and logs are stored in the backend data file so they remain after refresh or process restarts.
                            Use <span className="font-mono text-[11px] bg-white/80 px-1 rounded border border-slate-200/80">RUN_HISTORY_PATH</span> on deploy if the disk is ephemeral.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Total', value: stats.total, sub: 'all time', className: 'bg-white border-slate-200' },
                        { label: 'Done', value: stats.completed, sub: 'success', className: 'bg-emerald-50/80 border-emerald-100' },
                        { label: 'Failed', value: stats.failed, sub: 'needs review', className: 'bg-red-50/80 border-red-100' },
                        { label: 'Running', value: stats.running, sub: 'in progress', className: 'bg-blue-50/80 border-blue-100' },
                        { label: 'Paused', value: stats.paused, sub: 'resume', className: 'bg-amber-50/80 border-amber-100' },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-2xl border px-4 py-3 ${s.className}`}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">{s.value}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{s.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input
                                className="w-full h-10 pl-10 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                                placeholder="Search label, run id, user, email, outcome, env, IDs…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            disabled={filtered.length === 0 || exporting}
                            onClick={exportFilteredJson}
                            className="sm:hidden inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
                        >
                            <Download className="size-4" />
                            Export JSON
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                                <Filter className="size-3.5" /> Status
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {STATUS_FILTERS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors capitalize ${
                                            filterStatus === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-start gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 pt-1.5 w-[52px] sm:w-auto">
                                Type
                            </span>
                            <div className="flex flex-wrap gap-1.5 flex-1">
                                {MODE_FILTERS.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFilterMode(m)}
                                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                                            filterMode === m ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {m === 'all' ? 'All' : (MODE_META[m]?.tag || m.replace(/-/g, ' '))}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="size-8 text-blue-500 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
                        <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Clock className="size-8 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-700 mb-1">
                            {runs.length === 0 ? 'No history yet' : 'No matching runs'}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm">
                            {runs.length === 0 ? 'Run a task from the main page — it will show up here with full detail.' : 'Try loosening filters or clearing the search.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filtered.map((run) => {
                                const meta = MODE_META[run.mode] || DEFAULT_MODE_META;
                                const Icon = meta.icon;
                                const sb = STATUS_BADGE[run.status] || STATUS_BADGE.pending;
                                const SbIcon = sb.icon;
                                const dur = formatRunDuration(run);
                                const ss = stepSummary(run.steps);
                                const ctx = requestContext(run.mode, run.request);
                                const stepCount = run.stepCount ?? (Array.isArray(run.steps) ? run.steps.length : 0);
                                return (
                                    <motion.div
                                        key={run.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -12 }}
                                        layout
                                        onClick={() => navigate(`/history/${run.id}`)}
                                        className="cursor-pointer group"
                                    >
                                        <Card className="rounded-2xl border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all duration-200">
                                            <div className="flex items-stretch gap-0">
                                                <div className={`w-1 shrink-0 ${run.status === 'failed' ? 'bg-red-400' : run.status === 'completed' ? 'bg-emerald-400' : run.status === 'running' ? 'bg-blue-400' : 'bg-slate-300'}`} />
                                                <div className="flex-1 min-w-0 px-4 py-4 sm:px-5">
                                                    <div className="flex items-start gap-3 sm:gap-4">
                                                        <div className={`p-2.5 rounded-xl ${meta.bg} ${meta.border} border shrink-0`}>
                                                            <Icon className={`size-5 ${meta.color}`} strokeWidth={1.8} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 gap-y-1">
                                                                <h3 className="text-sm font-bold text-slate-900 truncate max-w-[min(100%,28rem)]">{run.label || run.id}</h3>
                                                                <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.color} ${meta.bg} px-2 py-0.5 rounded-md`}>
                                                                    {meta.tag}
                                                                </span>
                                                                <Badge variant={sb.variant} className="text-[10px] px-2 py-0.5 gap-1">
                                                                    <SbIcon className={`size-3 ${run.status === 'running' ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                                                                    {sb.label}
                                                                </Badge>
                                                                {stepCount > 0 && (
                                                                    <span className="text-[10px] font-semibold tabular-nums text-slate-500 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                                                                        {run.stepsCompleted != null && run.stepsFailed != null
                                                                            ? `${run.stepsCompleted}/${stepCount} steps`
                                                                            : `${stepCount} step${stepCount === 1 ? '' : 's'}`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-mono mt-1 truncate" title={run.id}>{run.id}</p>
                                                            {ctx && <p className="text-xs text-slate-600 mt-1 font-medium truncate">{ctx}</p>}
                                                            {run.resultMessage && (
                                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{run.resultMessage}</p>
                                                            )}
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-slate-500">
                                                                <span className="inline-flex items-center gap-1" title={formatHistoryDate(run.startedAt)}>
                                                                    <Clock className="size-3 shrink-0" />
                                                                    <span className="text-slate-600 font-medium">{formatRelativeTime(run.startedAt)}</span>
                                                                    <span className="text-slate-400 hidden sm:inline">· {formatHistoryDate(run.startedAt)}</span>
                                                                </span>
                                                                {dur && (
                                                                    <span className="inline-flex items-center gap-1 text-slate-600">
                                                                        Duration: <strong className="font-semibold text-slate-700">{dur}</strong>
                                                                    </span>
                                                                )}
                                                                {run.activeEnv && (
                                                                    <span className="inline-flex items-center gap-1 text-slate-600">
                                                                        <Server className="size-3 shrink-0" />
                                                                        {run.activeEnv}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {(run.user || run.userEmail) && (
                                                                <p className="text-[11px] text-slate-500 mt-2">
                                                                    <span className="font-medium text-slate-600">Started by</span>
                                                                    {run.user && ` ${run.user}`}
                                                                    {run.userEmail && <span className="text-slate-400"> · {run.userEmail}</span>}
                                                                </p>
                                                            )}
                                                            {ss && (
                                                                <div className="mt-3 space-y-1">
                                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                                        Steps {ss.completed}/{ss.total} completed
                                                                        {ss.failed > 0 && <span className="text-red-600 ml-1">({ss.failed} failed)</span>}
                                                                    </p>
                                                                    <div className="flex items-center gap-0.5 h-1.5">
                                                                        {run.steps.map((s, i) => (
                                                                            <div
                                                                                key={s.id || i}
                                                                                className={`flex-1 min-w-0 h-full rounded-full ${
                                                                                    s.status === 'completed' ? 'bg-emerald-400' :
                                                                                    s.status === 'failed' ? 'bg-red-400' :
                                                                                    s.status === 'running' ? 'bg-blue-400 animate-pulse' :
                                                                                    'bg-slate-200'
                                                                                }`}
                                                                                title={`${s.label || s.id}: ${s.status}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ChevronRight className="size-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HistoryPage;
