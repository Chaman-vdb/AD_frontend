import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Loader2,
    Copy,
    Check,
} from 'lucide-react';
import HistoryPageShell from '../components/HistoryPageShell.jsx';
import StatusLog from '../components/StatusLog.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { apiFetch } from '../lib/api.js';
import {
    MODE_META,
    DEFAULT_MODE_META,
    formatRelativeTime,
    formatHistoryDate,
    formatRunDuration,
    requestContext,
    runStatusRibbon,
} from '../lib/historyMeta.js';

function statusBadgeVariant(status) {
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'destructive';
    if (status === 'running') return 'warning';
    return 'secondary';
}

function statusBorderClass(status) {
    if (status === 'completed') return 'border-l-emerald-500';
    if (status === 'failed') return 'border-l-red-500';
    if (status === 'running') return 'border-l-blue-500';
    return 'border-l-slate-300';
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

    const meta = run ? (MODE_META[run.mode] || DEFAULT_MODE_META) : null;
    const Ribbon = run ? runStatusRibbon(run.status) : null;
    const duration = run ? formatRunDuration(run) : null;
    const ctx = run ? requestContext(run.mode, run.request) : null;
    const Icon = meta?.icon;

    const logs = useMemo(() => {
        if (!Array.isArray(run?.events)) return [];
        return run.events
            .filter((e) => e && e.message && e.type !== 'steps' && e.type !== 'step' && e.type !== 'run-id')
            .map((e) => {
                const t = String(e.type || 'log').toLowerCase();
                let type = 'log';
                if (t.includes('error') || t === 'stderr') type = 'error';
                else if (t.includes('success') || t === 'done') type = 'success';
                else if (t.includes('progress')) type = 'progress';
                return { type, message: e.message, timestamp: e.timestamp };
            });
    }, [run]);

    const copyId = () => {
        if (!run?.id || !navigator.clipboard?.writeText) return;
        navigator.clipboard.writeText(run.id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (loading) {
        return (
            <HistoryPageShell title="Run detail" subtitle="Loading…">
                <div className="flex justify-center py-24">
                    <Loader2 className="size-6 text-slate-400 animate-spin" />
                </div>
            </HistoryPageShell>
        );
    }

    if (!run) {
        return (
            <HistoryPageShell backTo="/history" backLabel="Back to history" title="Not found">
                <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                    <p className="text-sm text-slate-600">This run was removed or doesn&apos;t exist.</p>
                    <Link to="/history" className="inline-block mt-3 text-sm font-medium text-blue-600 hover:underline">
                        Back to history
                    </Link>
                </div>
            </HistoryPageShell>
        );
    }

    const summary = run.resultMessage || ctx || 'No summary available.';

    return (
        <HistoryPageShell
            backTo="/history"
            backLabel="Back to history"
            title={run.label || meta.tag}
            subtitle={`${meta.tag} · ${formatRelativeTime(run.startedAt)}`}
            actions={(
                <button
                    type="button"
                    onClick={copyId}
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    {copied ? 'Copied' : 'Copy ID'}
                </button>
            )}
        >
            <div className="space-y-5">
                <Card className={`border-l-4 ${statusBorderClass(run.status)} p-0 overflow-hidden shadow-sm`}>
                    <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            {Icon ? (
                                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${meta.bg} border ${meta.border}`}>
                                    <Icon className={`size-5 ${meta.color}`} />
                                </div>
                            ) : null}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-slate-900">{meta.tag}</span>
                                    <Badge variant={statusBadgeVariant(run.status)} className="text-[10px] capitalize">
                                        {Ribbon.label}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
                                <p className="text-xs text-slate-400 mt-2 font-mono truncate" title={run.id}>{run.id}</p>
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-3 shrink-0 text-xs">
                            <div>
                                <dt className="text-slate-400">Started</dt>
                                <dd className="text-slate-800 font-medium mt-0.5">{formatHistoryDate(run.startedAt)}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400">Ended</dt>
                                <dd className="text-slate-800 font-medium mt-0.5">{run.endedAt ? formatHistoryDate(run.endedAt) : '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400">Duration</dt>
                                <dd className="text-slate-800 font-medium mt-0.5 tabular-nums">{duration || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400">User</dt>
                                <dd className="text-slate-800 font-medium mt-0.5 truncate max-w-[12rem]" title={run.userEmail || run.user}>
                                    {run.userEmail || run.user || '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </Card>

                            <div className="mt-4 w-7xl justify-center mx-auto">
                            <StatusLog logs={logs} />

                            </div>
            </div>
        </HistoryPageShell>
    );
}

export default RunDetailPage;
