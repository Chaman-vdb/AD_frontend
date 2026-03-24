import React from 'react';
import { NAV_ITEMS } from './constants.js';
import { SCRIPT_FIELDS } from './components/ScriptRunnerForm.jsx';

const SAMPLE_IMPORT_SHEET_URL =
    'https://docs.google.com/spreadsheets/d/1cFRVoDdhwU9zlCH_q3e-TR5KkRvHuxiy9KmTU4SsaKo/edit?usp=sharing';

/**
 * Contextual workflow notes shown on the main panel (not the left sidebar).
 * Hidden while a run is in progress.
 */
export function getWorkflowNote(mode) {
    if (mode === 'org') {
        return (
            <div className="rounded-lg border border-violet-200 bg-violet-50/90 px-3 py-2.5 text-left text-[11px] text-violet-900 leading-relaxed max-w-lg w-full mx-auto">
                <p className="font-semibold text-violet-950 mb-1">Copy organization — what gets replicated</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>
                        <strong>Customizations (API):</strong> JSON navigation menu, global custom text, per-language custom
                        texts, and customization rows for PDP, search form, search result, and unified product page (from the
                        customizations table).
                    </li>
                    <li>
                        <strong>Also (when present on source):</strong> white label configs and custom search menus in their
                        own steps.
                    </li>
                    <li>
                        <strong>Org settings:</strong> active org feature toggles are applied on the org edit screen (with
                        access where the UI supports it).
                    </li>
                </ul>
                <p className="font-semibold text-violet-950 mt-2 mb-1">Limits</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Unknown customization types are skipped by the copier.</li>
                    <li>Any org setting whose checkbox cannot be matched on the edit page is skipped.</li>
                </ul>
            </div>
        );
    }

    if (mode === 'company') {
        return (
            <div className="rounded-lg border border-blue-200 bg-blue-50/90 px-3 py-2.5 text-left text-[11px] text-blue-900 leading-relaxed max-w-lg w-full mx-auto">
                <p className="font-semibold text-blue-950 mb-1">Copy company — verified behavior</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>
                        <strong>Groups:</strong> source company groups and group memberships are not copied. The new company is
                        created with a default group only, not the source company’s groups.
                    </li>
                    <li>
                        <strong>Feature switches:</strong> only active features on the source are considered; the tool enables
                        matching toggles on the target. Per-feature <code className="text-[10px]">access</code> levels are not
                        copied from the source.
                    </li>
                    <li>
                        <strong>Other settings:</strong> company fields copied via the new-company form and locations; other
                        company settings outside this flow are not replicated.
                    </li>
                </ul>
                <p className="mt-2 text-blue-800/90">
                    When the run finishes, the log includes a <strong>Summary: not copied</strong> section listing feature
                    switches that could not be activated and reminders.
                </p>
            </div>
        );
    }

    if (mode === 'user') {
        return (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-[11px] text-slate-700 leading-relaxed max-w-lg w-full mx-auto">
                Creates users via Playwright against the base URL you provide. Ensure the admin credentials and company id are
                correct for production.
            </div>
        );
    }

    if (mode === 'bulk-users-sheet') {
        return (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-left text-[11px] text-emerald-900 leading-relaxed max-w-lg w-full mx-auto">
                <p className="font-semibold text-emerald-950 mb-1">Bulk users (sheet)</p>
                <p>
                    Validates and creates users from your spreadsheet. Optional: verify email after each create. Use Validate
                    first to catch username conflicts before a full run.
                </p>
            </div>
        );
    }

    if (mode === 'inventory-permissions') {
        return (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50/90 px-3 py-2.5 text-left text-[11px] text-cyan-900 leading-relaxed max-w-lg w-full mx-auto">
                Sets up API client / inventory permissions between client and vendor companies for the selected product types.
            </div>
        );
    }

    const nav = NAV_ITEMS.find((n) => n.id === mode);
    const scriptKey = nav?.scriptKey;
    if (!scriptKey) return null;
    const cfg = SCRIPT_FIELDS[scriptKey];
    if (!cfg) return null;

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2.5 text-left text-[11px] text-amber-900 leading-relaxed max-w-lg w-full mx-auto">
            <p className="font-semibold text-amber-950 mb-1">{cfg.title}</p>
            <p className="leading-relaxed">{cfg.description}</p>
            {scriptKey === 'importCustomSearchMenusFromSheet' && (
                <p className="mt-2 text-amber-950/90">
                    SVG / PNG columns may be plain <code className="text-[10px]">https://</code> URLs or hyperlinks to public
                    files (e.g. CDN). Sample:{' '}
                    <a
                        href={SAMPLE_IMPORT_SHEET_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline underline-offset-2 hover:text-amber-950"
                    >
                        Google Sheet
                    </a>
                </p>
            )}
        </div>
    );
}
