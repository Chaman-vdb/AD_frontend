import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    User,
    Mail,
    ListChecks,
    Terminal,
    Info,
    Copy,
    Check,
    Server,
    Hash,
    Activity,
} from 'lucide-react';
import { apiFetch } from '../lib/api.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import {
    MODE_META,
    DEFAULT_MODE_META,
    STATUS_BADGE,
    formatHistoryDate,
    formatRunDuration,
    humanizeRequestKey,
} from '../lib/historyMeta.js';

function prettyValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
}

function isMultiline(value) {
    if (value == null) return false;
    if (typeof value === 'object') return true;
    return String(value).length > 80 || String(value).includes('\n');
}

function logTypeClass(type) {
    const t = String(type || 'log').toLowerCase();
    if (t.includes('error') || t === 'stderr') return 'text-red-300';
    if (t.includes('warn')) return 'text-amber-300';
    if (t.includes('success') || t === 'done') return 'text-emerald-300';
    return 'text-slate-200';
}

function RunDetailPage() {
    const { runId } = useParams();
    const [run, setRun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        apiFetch(`/api/history/${runId}`)
            .then((res) => {
                if (!res.ok) throw new Error('not-found');
                return res.json();
            })
            .then((data) => {
                if (!active) return;
                setRun(data);
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setRun(null);
                setLoading(false);
            });
        return () => { active = false; };
    }, [runId]);

    const displayEvents = useMemo(() => (
        Array.isArray(run?.events)
            ? run.events.filter((e) => e && e.message && e.type !== 'steps' && e.type !== 'step' && e.type !== 'run-id')
            : []
    ), [run]);

    const meta = run ? (MODE_META[run.mode] || DEFAULT_MODE_META) : null;
    const Icon = meta?.icon;
    const sb = run ? (STATUS_BADGE[run.status] || STATUS_BADGE.pending) : null;
    const SbIcon = sb?.icon;
    const duration = run ? formatRunDuration(run) : null;

    const copyId = () => {
        if (!run?.id || !navigator.clipboard?.writeText) return;
        navigator.clipboard.writeText(run.id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Activity className="size-5 text-blue-500 animate-pulse" />
                    Loading run details…
                </div>
            </div>
        );
    }

    if (!run) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6">
                <div className="max-w-3xl mx-auto">
                    <Link to="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                        <ArrowLeft className="size-4" /> Back to history
                    </Link>
                    <Card className="mt-6 rounded-2xl border-slate-200 p-6 shadow-sm">
                        <p className="text-sm text-slate-600">This run was not found. It may have been removed or the link is invalid.</p>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/90 to-white pb-12">
            <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-start gap-4">
                    <Link
                        to="/history"
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
                        aria-label="Back to history"
                    >
                        <ArrowLeft className="size-5 text-slate-600" />
                    </Link>
                    <div className={`p-3 rounded-2xl border shrink-0 ${meta.bg} ${meta.border}`}>
                        {Icon && <Icon className={`size-7 ${meta.color}`} strokeWidth={1.75} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 gap-y-1">
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight break-words">{run.label || run.id}</h1>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.color} ${meta.bg} px-2 py-0.5 rounded-md border ${meta.border}`}>
                                {meta.tag}
                            </span>
                            {sb && SbIcon && (
                                <Badge variant={sb.variant} className="text-[10px] px-2 py-0.5 gap-1">
                                    <SbIcon className={`size-3 ${run.status === 'running' ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                                    {sb.label}
                                </Badge>
                            )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 font-mono bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg max-w-full truncate" title={run.id}>
                                <Hash className="size-3 shrink-0" />
                                {run.id}
                            </span>
                            <button
                                type="button"
                                onClick={copyId}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-blue-200 transition-colors"
                            >
                                {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                                {copied ? 'Copied' : 'Copy ID'}
                            </button>
                            {run.activeEnv && (
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                    <Server className="size-3.5 shrink-0" />
                                    {run.activeEnv}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
                <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex gap-3">
                            <Clock className="size-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Started</p>
                                <p className="text-slate-800 font-medium mt-0.5">{formatHistoryDate(run.startedAt)}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Clock className="size-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Ended</p>
                                <p className="text-slate-800 font-medium mt-0.5">{run.endedAt ? formatHistoryDate(run.endedAt) : '—'}</p>
                            </div>
                        </div>
                        {duration && (
                            <div className="flex gap-3 sm:col-span-2">
                                <Activity className="size-4 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Duration</p>
                                    <p className="text-slate-800 font-semibold mt-0.5 tabular-nums">{duration}</p>
                                    {run.durationMs != null && (
                                        <p className="text-[11px] text-slate-400 mt-0.5">{run.durationMs.toLocaleString()} ms</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <User className="size-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Operator</p>
                                <p className="text-slate-800 font-medium mt-0.5">{run.user || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Mail className="size-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Operator email</p>
                                <p className="text-slate-800 font-medium mt-0.5 break-all">{run.userEmail || '—'}</p>
                            </div>
                        </div>
                        {(run.orgId != null || run.userId != null) && (
                            <div className="flex gap-3 sm:col-span-2 flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
                                {run.orgId != null && <span><span className="text-slate-400 font-semibold">Org ID</span> {run.orgId}</span>}
                                {run.userId != null && <span><span className="text-slate-400 font-semibold">User ID</span> {run.userId}</span>}
                            </div>
                        )}
                    </div>
                    {run.resultMessage && (
                        <div className="px-5 pb-5">
                            <div className="rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50 to-indigo-50/50 px-4 py-3 text-sm text-blue-900 flex gap-3">
                                <Info className="size-4 mt-0.5 shrink-0 text-blue-600" />
                                <p className="leading-relaxed">{run.resultMessage}</p>
                            </div>
                        </div>
                    )}
                </Card>

                <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Request snapshot</h2>
                        <p className="text-[11px] text-slate-500 mt-1">Values as submitted for this run (stored server-side for audit).</p>
                    </div>
                    <div className="p-5">
                        {run.request && Object.keys(run.request).length > 0 ? (
                            <dl className="grid grid-cols-1 gap-3">
                                {Object.entries(run.request).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="rounded-xl border border-slate-200/90 bg-slate-50/40 px-4 py-3"
                                    >
                                        <dt className="text-[11px] font-semibold text-slate-500">{humanizeRequestKey(key)}</dt>
                                        <dd className={`mt-1.5 text-sm text-slate-800 ${isMultiline(value) ? 'font-mono whitespace-pre-wrap break-all' : 'break-all'}`}>
                                            {prettyValue(value)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="text-sm text-slate-500">No request snapshot stored for this run.</p>
                        )}
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <ListChecks className="size-4 text-slate-500" />
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Steps</h2>
                            {run.stepCount != null && (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {run.stepsCompleted ?? '—'} completed
                                    {(run.stepsFailed ?? 0) > 0 && (
                                        <span className="text-red-600 font-medium"> · {run.stepsFailed} failed</span>
                                    )}
                                    <span className="text-slate-400"> · {run.stepCount} total</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="p-5">
                        {Array.isArray(run.steps) && run.steps.length > 0 ? (
                            <ul className="relative space-y-0 pl-2">
                                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
                                {run.steps.map((step, idx) => (
                                    <li key={`${step.id || step.label}-${idx}`} className="relative flex gap-4 pb-6 last:pb-0">
                                        <div
                                            className={`relative z-[1] size-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                                step.status === 'completed' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                                                step.status === 'failed' ? 'bg-red-50 border-red-300 text-red-700' :
                                                step.status === 'running' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                                                'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900">{step.label || step.id}</p>
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                    {step.status || 'pending'}
                                                </span>
                                                {step.duration != null && (
                                                    <span className="text-[11px] text-slate-500 tabular-nums">
                                                        {typeof step.duration === 'number' ? `${(step.duration / 1000).toFixed(1)}s` : String(step.duration)}
                                                    </span>
                                                )}
                                            </div>
                                            {step.error && (
                                                <p className="text-xs text-red-600 mt-2 leading-relaxed border-l-2 border-red-200 pl-3">{step.error}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">No step details stored.</p>
                        )}
                    </div>
                </Card>

                <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Terminal className="size-4 text-slate-500" />
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Event log</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">{displayEvents.length} entr{displayEvents.length === 1 ? 'y' : 'ies'}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-b-2xl">
                        <div className="rounded-lg border border-slate-800 max-h-[min(480px,55vh)] overflow-y-auto">
                            {displayEvents.length > 0 ? (
                                <div className="p-3 space-y-2 font-mono text-[11px] leading-relaxed">
                                    {displayEvents.map((event, idx) => (
                                        <div
                                            key={`${event.timestamp || idx}-${idx}`}
                                            className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border-b border-slate-800/80 pb-2 last:border-0 last:pb-0"
                                        >
                                            <span className="text-slate-500 shrink-0 tabular-nums">
                                                {event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                                            </span>
                                            <span className={`shrink-0 font-bold uppercase text-[10px] ${logTypeClass(event.type)}`}>
                                                [{event.type}]
                                            </span>
                                            <span className="text-slate-300 break-words">{event.message}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="p-4 text-sm text-slate-500">No log lines stored for this run.</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default RunDetailPage;
