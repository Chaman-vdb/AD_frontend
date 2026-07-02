import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Edge-to-edge history layout — no max-width column. */
export function HistoryPageShell({ backTo = '/', backLabel = 'Back to dashboard', title, subtitle, actions, children }) {
    return (
        <div className="min-h-screen w-full bg-[#f4f5f7] flex flex-col">
            <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white">
                <div className="w-full px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            to={backTo}
                            className="p-1.5 -ml-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0"
                            aria-label={backLabel}
                        >
                            <ArrowLeft className="size-4 text-slate-500" />
                        </Link>
                        <div className="min-w-0 border-l border-slate-200 pl-3">
                            <h1 className="text-base font-semibold text-slate-900 leading-tight truncate">{title}</h1>
                            {subtitle ? (
                                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
                            ) : null}
                        </div>
                    </div>
                    {actions ? (
                        <div className="flex items-center gap-2 shrink-0">
                            {actions}
                        </div>
                    ) : null}
                </div>
            </header>

            <main className="flex-1 w-full px-5 sm:px-8 py-5 pb-10">
                {children}
            </main>
        </div>
    );
}

export default HistoryPageShell;
