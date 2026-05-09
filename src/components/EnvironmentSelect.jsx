import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils.js';

/**
 * Preset automation target (STAGE_BASE_URL). Options/current typically from GET /api/target-environment/public.
 */
export function EnvironmentSelect({
    current,
    options = [],
    onChange,
    disabled = false,
    saving = false,
    className,
    id,
}) {
    const presetIds = new Set(options.map((o) => o.id));
    const value = current?.id && presetIds.has(current.id) ? current.id : 'custom';

    return (
        <div className={cn('relative inline-flex items-center', className)}>
            <select
                id={id}
                value={value}
                disabled={disabled || saving || value === 'custom'}
                onChange={(e) => {
                    const next = e.target.value;
                    if (next && next !== 'custom') onChange?.(next);
                }}
                className={cn(
                    'appearance-none pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white',
                    'text-[11px] font-semibold text-slate-700 max-w-[11rem] sm:max-w-[13rem] truncate',
                    'focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300',
                    (disabled || saving) && 'opacity-60 cursor-not-allowed',
                )}
                aria-label="VDB automation target"
            >
                {value === 'custom' && (
                    <option value="custom">
                        Custom: {current?.baseUrl || '—'}
                    </option>
                )}
                {options.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-slate-400" aria-hidden />
        </div>
    );
}

export default EnvironmentSelect;
