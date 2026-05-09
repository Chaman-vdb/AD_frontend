import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Database, LogOut } from 'lucide-react';
import { SidebarTrigger } from './Sidebar.jsx';
import StepPipeline from './StepPipeline.jsx';
import StatusLog from './StatusLog.jsx';
import { Card } from './ui/Card.jsx';
import { Badge } from './ui/Badge.jsx';
import { fadeIn } from '../constants.js';
import EnvironmentSelect from './EnvironmentSelect.jsx';

function MainContent({
    activeNavItem, ActiveIcon, isRunning, dbStatus,
    steps, logs, overallStatus, runStartTime, selectedOrg,
    onResume, onRetry, onSkip, onOpenSidebar,
    currentUserEmail, onLogout,
    /** Shown in the idle empty state (hidden while a run is in progress). */
    workflowNote,
    targetEnvironment,
    onTargetEnvironmentChange,
    targetEnvironmentSaving = false,
}) {
    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <header className="min-h-[62px] border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-2 sm:py-0 sm:h-[62px] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <SidebarTrigger onClick={onOpenSidebar} className="lg:hidden shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1 rounded-md shrink-0 ${activeNavItem?.iconBg || 'bg-slate-100'}`}>
                            <ActiveIcon className={`size-3.5 ${activeNavItem?.iconColor || 'text-slate-600'}`} strokeWidth={2} />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">{activeNavItem?.label || 'Select Workflow'}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 sm:justify-end">
                    {targetEnvironment?.options?.length > 0 && (
                        <EnvironmentSelect
                            current={targetEnvironment.current}
                            options={targetEnvironment.options}
                            onChange={onTargetEnvironmentChange}
                            disabled={isRunning}
                            saving={targetEnvironmentSaving}
                            className="shrink-0"
                        />
                    )}
                    <Badge variant={dbStatus === 'connected' ? 'success' : dbStatus === 'error' ? 'destructive' : 'warning'} className="px-2 py-0.5 text-[10px] inline-flex items-center gap-1">
                        <Database className="size-3 shrink-0" />
                        <span className="hidden sm:inline">{dbStatus === 'connected' ? 'Online' : dbStatus === 'error' ? 'Offline' : 'Checking'}</span>
                        <span className="sm:hidden">{dbStatus === 'connected' ? 'OK' : dbStatus === 'error' ? '!' : '…'}</span>
                    </Badge>
                    <div className="hidden md:flex items-center gap-2 ml-0 sm:ml-1 min-w-0">
                        <span className="text-[11px] font-medium text-slate-600 truncate max-w-[10rem] lg:max-w-[14rem]" title={currentUserEmail || ''}>
                            {currentUserEmail || '—'}
                        </span>
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 shrink-0"
                            title="Logout"
                        >
                            <LogOut className="size-3" />
                            Logout
                        </button>
                    </div>
                </div>
                <div className="flex md:hidden w-full items-center justify-end gap-2 border-t border-slate-100 pt-2 mt-0.5 sm:border-0 sm:pt-0 sm:mt-0">
                    <span className="text-[10px] font-medium text-slate-600 truncate flex-1 min-w-0 text-right" title={currentUserEmail || ''}>
                        {currentUserEmail || '—'}
                    </span>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 shrink-0"
                        title="Logout"
                    >
                        <LogOut className="size-3" />
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6">
                    {steps.length > 0 || logs.length > 0 ? (
                        <div className={`flex gap-5 ${steps.length > 0 && logs.length > 0 ? 'flex-row' : 'flex-col'}`}>
                            {steps.length > 0 && (
                                <motion.div {...fadeIn} className={logs.length > 0 ? 'w-1/2 min-w-0' : 'w-full'}>
                                    <Card className="overflow-hidden border-slate-200 h-full">
                                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-900">
                                                    {activeNavItem?.label || 'Process'} {selectedOrg ? `· Org #${selectedOrg}` : ''}
                                                </h2>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Started {runStartTime ? `${runStartTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}, ${runStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '—'}
                                                </p>
                                            </div>
                                            <Badge variant={overallStatus === 'running' ? 'info' : overallStatus === 'completed' ? 'success' : overallStatus === 'failed' ? 'destructive' : 'secondary'} className="capitalize text-[10px] px-2.5">
                                                {overallStatus === 'idle' ? 'Ready' : overallStatus}
                                            </Badge>
                                        </div>
                                        <div className="px-5 py-4">
                                            <StepPipeline steps={steps} onResume={onResume} onRetry={onRetry} onSkip={onSkip} isRunning={isRunning} />
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {logs.length > 0 && (
                                    <motion.div {...fadeIn} className={steps.length > 0 ? 'w-1/2 min-w-0' : 'w-full'}>
                                        <StatusLog logs={logs} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center w-full max-w-2xl mx-auto px-2">
                            <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <ActiveIcon className="size-7 text-slate-400" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-1">{activeNavItem?.label || 'Select a Workflow'}</h3>
                            <p className="text-sm text-slate-400 max-w-sm mb-4">Configure the parameters in the left panel and click Start to begin.</p>
                            {!isRunning && workflowNote ? (
                                <div className="w-full mt-1">{workflowNote}</div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MainContent;
