import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    Copy,
    Check,
    ChevronDown,
} from 'lucide-react';
import { apiFetch } from '../lib/api.js';
import { Card } from '../components/ui/Card.jsx';
import {
    MODE_META,
    DEFAULT_MODE_META,
    formatHistoryDateCalendar,
    formatRelativeTime,
    formatHistoryDate,
    formatRunDuration,
    formatDurationMs,
    humanizeRequestKey,
    requestContext,
    runStatusRibbon,
    stepStatusRibbon,
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

function DetailsPanel({ title, children, defaultOpen = false }) {
    return (
        <details open={defaultOpen} className="group rounded-2xl border border-slate-200 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 rounded-2xl">
                <span className="text-sm font-semibold text-slate-900">{title}</span>
                <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" strokeWidth={2} />
            </summary>
            <div className="border-t border-slate-100 px-4 pb-4 pt-1">{children}</div>
        </details>
    );
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
        return () => {
            active = false;
        };
    }, [runId]);

    const displayEvents = useMemo(
        () => (Array.isArray(run?.events)
            ? run.events.filter((e) => e && e.message && e.type !== 'steps' && e.type !== 'step' && e.type !== 'run-id')
            : []
        ), [run],
    );

    const meta = run ? (MODE_META[run.mode] || DEFAULT_MODE_META) : null;
    const Ribbon = run ? runStatusRibbon(run.status) : null;
    const duration = run ? formatRunDuration(run) : null;
    const ctx = run ? requestContext(run.mode, run.request) : null;
    const steps = run && Array.isArray(run.steps) ? run.steps : [];

    const copyId = () => {
        if (!run?.id || !navigator.clipboard?.writeText) return;
        navigator.clipboard.writeText(run.id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Loader2 className="size-5 text-slate-400 animate-spin" />
                    Loading…
                </div>
            </div>
        );
    }

    if (!run) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <Link to="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                        <ArrowLeft className="size-4" /> Back to history
                    </Link>
                    <Card className="mt-6 rounded-2xl border-slate-200 p-8 shadow-sm">
                        <p className="text-sm text-slate-600">This run was not found. It may have been removed.</p>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-16">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
                <div className=" mx-auto px-4 sm:px-6 py-5 flex flex-col gap-3 md:items-center sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-8 min-w-0">
                        <Link to="/history" className="p-2 rounded-lg hover:bg-slate-100 shrink-0 mt-0.5" aria-label="Back to history">
                            <ArrowLeft className="size-8 text-slate-600" />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                                {meta.tag}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {run.label}
                                {' · '}
                                {formatRelativeTime(run.startedAt)}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={copyId}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        {copied ? 'Copied' : 'Copy run ID'}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">
                <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <p className="text-xs text-slate-500">Run ID</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 font-mono break-all">{run.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Started</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{formatHistoryDateCalendar(run.startedAt)}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{formatRelativeTime(run.startedAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{duration ? 'Duration' : 'Status'}</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{duration || Ribbon.label}</p>
                                {run.resultMessage ? (
                                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-4 leading-relaxed">{run.resultMessage}</p>
                                ) : ctx ? (
                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2" title={ctx}>{ctx}</p>
                                ) : null}
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 justify-between pt-4 border-t border-slate-100">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                                <span className={`size-2 rounded-full shrink-0 ${Ribbon.dot} ${Ribbon.pulse ? 'animate-pulse' : ''}`} />
                                {Ribbon.label}
                                <span className="text-slate-300">·</span>
                                <span className="font-medium text-slate-500">{meta.tag}</span>
                                {run.activeEnv ? (
                                    <>
                                        <span className="text-slate-300">·</span>
                                        <span className="font-normal text-slate-400">Production</span>
                                    </>
                                ) : null}
                            </div>
                            {(run.user || run.userEmail) ? (
                                <p className="text-[11px] text-slate-400 truncate max-w-full sm:max-w-md text-right">
                                    {run.user && run.userEmail && ' · '}
                                    {run.userEmail}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white">
                        {steps.length === 0 ? (
                            <div className="px-5 sm:px-6 py-6 text-sm text-slate-500">No steps recorded for this run.</div>
                        ) : (
                            steps.map((s, idx) => {
                                const Sr = stepStatusRibbon(s.status);
                                const sd = formatDurationMs(s.duration);
                                const numStyle = s.status === 'completed'
                                    ? 'border border-emerald-50 bg-emerald-50 text-emerald-800'
                                    : s.status === 'failed'
                                      ? 'border-red-300 bg-red-50 text-red-800'
                                      : s.status === 'running'
                                        ? 'border-blue-300 bg-blue-50 text-blue-800'
                                        : 'border-slate-200 bg-slate-50 text-slate-600';
                                return (
                                    <div key={s.id || idx} className="px-5 sm:px-6 py-4 flex gap-4 items-center">
                                        <div
                                            className={`size-10 shrink-0 rounded-lg border-2 flex items-center justify-center text-sm font-bold tabular-nums ${numStyle}`}
                                            aria-label={`Step ${idx + 1}`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <p className="font-semibold text-sm text-slate-900">{s.label || s.id}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {Sr.label}
                                                {sd ? ` · ${sd}` : ''}
                                                {s.error ? ` — ${s.error}` : ''}
                                            </p>
                                        </div>
                                        <div className="self-center flex items-center gap-2 text-xs font-semibold text-slate-700 shrink-0 whitespace-nowrap">
                                            <span className={`size-2 rounded-full ${Sr.dot} ${Sr.pulse ? 'animate-pulse' : ''}`} />
                                            {Sr.label}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {(steps.length > 0 || (run.stepCount != null && run.stepCount > 0)) && (
                        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-500">
                            {(run.stepsCompleted != null ? run.stepsCompleted : steps.filter((st) => st.status === 'completed').length)}{' '} of{' '}
                            {run.stepCount ?? steps.length} steps completed
                            {(run.stepsFailed ?? 0) > 0 && <span className="text-red-600 ml-2">{run.stepsFailed} failed</span>}
                        </div>
                    )}
                </Card>

                <DetailsPanel title="Timestamps & IDs">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Started</dt>
                            <dd className="text-slate-800 mt-0.5">{formatHistoryDate(run.startedAt)}</dd>
                        </div>
                        <div>
                            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Ended</dt>
                            <dd className="text-slate-800 mt-0.5">{run.endedAt ? formatHistoryDate(run.endedAt) : '—'}</dd>
                        </div>
                        {duration ? (
                            <div>
                                <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Duration</dt>
                                <dd className="text-slate-800 font-semibold tabular-nums mt-0.5">{duration}</dd>
                            </div>
                        ) : null}
                        {run.durationMs != null ? (
                            <div>
                                <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Duration (ms)</dt>
                                <dd className="text-slate-800 tabular-nums mt-0.5">{run.durationMs.toLocaleString()}</dd>
                            </div>
                        ) : null}
                        {run.userId != null ? (
                            <div>
                                <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Superadmin User ID</dt>
                                <dd className="text-slate-800 mt-0.5">{run.userId}</dd>
                            </div>
                        ) : null}
                    </dl>
                </DetailsPanel>

                <DetailsPanel title="Request inputs">
                    {run.request && Object.keys(run.request).length > 0 ? (
                        <dl className="grid grid-cols-2">
                            {Object.entries(run.request).map(([key, value]) => (
                                <div key={key} className="rounded-xl  py-2">
                                    <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ">{humanizeRequestKey(key)}</dt>
                                    <dd className={`text-slate-800 mt-0.5 text-sm${isMultiline(value) ? 'font-mono whitespace-pre-wrap break-all' : 'break-all'}`}>
                                        {prettyValue(value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="text-sm text-slate-500">No inputs stored.</p>
                    )}
                </DetailsPanel>

                <DetailsPanel title={`Event log (${displayEvents.length})`}>
                    <div className="rounded-lg border border-slate-800 bg-slate-950 max-h-[min(420px,50vh)] overflow-y-auto">
                        {displayEvents.length > 0 ? (
                            <div className="p-3 space-y-2 font-mono text-[11px] leading-relaxed">
                                {displayEvents.map((event, idx) => (
                                    <div
                                        key={`${event.timestamp || idx}-${idx}`}
                                        className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border-b border-slate-800/80 pb-2 last:border-0 last:pb-0"
                                    >
                                        <span className="text-slate-500 shrink-0 tabular-nums">
                                            {event.timestamp
                                                ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : '—'}
                                        </span>
                                        <span className={`shrink-0 font-bold uppercase text-[10px] ${logTypeClass(event.type)}`}>
                                            [{event.type}]
                                        </span>
                                        <span className="text-slate-300 break-words">{event.message}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="p-4 text-sm text-slate-500">No log lines stored.</p>
                        )}
                    </div>
                </DetailsPanel>
            </div>
        </div>
    );
}

export default RunDetailPage;
