import React, { useCallback, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Database,
    Download,
    Layers,
    Loader2,
    LogOut,
    Package,
    Percent,
    Play,
} from 'lucide-react';
import { apiFetch, apiJson } from '../lib/api.js';

const MARKUP_NAV = [
    { id: 'tiered', label: 'Tiered price', to: '/marup-verification', icon: Percent, end: true },
    {
        id: 'supplier_tiered',
        label: 'Supplier + tiered',
        to: '/marup-verification/supplier-tiered',
        icon: Package,
    },
    { id: 'flat', label: 'Flat markup', disabled: true },
    { id: 'future', label: 'More markups…', disabled: true },
];

/** Match order: Jewelry, Lab grown, Gemstone, Diamond (natural = explicit lab_grown false). */
const PRODUCT_TABS = [
    { id: 'jewelry', label: 'Jewelry', productKey: 'Jewelry' },
    { id: 'labgrown', label: 'Lab grown', productKey: 'LabGrownDiamond' },
    { id: 'gemstone', label: 'Gemstone', productKey: 'Gemstone' },
    { id: 'diamond', label: 'Diamond', productKey: 'Diamond' },
];

const CATEGORY_DISPLAY_ORDER = [
    { key: 'Jewelry', label: 'Jewelry' },
    { key: 'LabGrownDiamond', label: 'Lab grown' },
    { key: 'Gemstone', label: 'Gemstone' },
    { key: 'Diamond', label: 'Diamond' },
];

const STATUS_TABS = ['all', 'mismatch', 'ok'];

function rowMatchesProductTab(row, tabId) {
    const tab = PRODUCT_TABS.find((t) => t.id === tabId);
    if (!tab) return true;
    return row.product_key === tab.productKey;
}

/** Skipped / no-CSP rows are dropped from the grid (not part of compare display). */
function isComparableRow(row) {
    return row.status !== 'skipped' && row.status !== 'missing_system';
}

function formatMoneyCell(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : '—';
}

function formatUpdatedAt(r) {
    const t = r.simp_updated_at ?? r.csp_updated_at;
    return t ? new Date(t).toLocaleString() : '—';
}

export default function MarupVerificationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const supplierTieredMode = location.pathname.includes('supplier-tiered');
    const verifyApiUrl = supplierTieredMode
        ? '/api/marup-verification/supplier-tiered'
        : '/api/marup-verification/tiered';
    const exportApiUrl = `${verifyApiUrl}/export`;
    const [companyId, setCompanyId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [productTab, setProductTab] = useState('jewelry');
    const [vendorTab, setVendorTab] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleLogout = useCallback(async () => {
        await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        navigate('/login', { replace: true });
    }, [navigate]);

    const [exporting, setExporting] = useState(false);

    const handleDownloadInventory = useCallback(async () => {
        const id = companyId.trim();
        if (!id || exporting || loading) return;
        setExporting(true);
        setError('');
        try {
            const res = await apiFetch(`${exportApiUrl}?company_id=${encodeURIComponent(id)}`);
            if (!res.ok) {
                const ct = res.headers.get('content-type') ?? '';
                if (ct.includes('application/json')) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || 'Export failed');
                }
                const text = await res.text().catch(() => '');
                throw new Error(text || `Export failed (${res.status})`);
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `marup-${supplierTieredMode ? 'supplier-tiered' : 'tiered'}-${id}.xlsx`;
            a.rel = 'noopener';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            setError(e?.message || 'Export failed');
        } finally {
            setExporting(false);
        }
    }, [companyId, exporting, loading, exportApiUrl, supplierTieredMode]);

    React.useEffect(() => {
        setResult(null);
        setError('');
    }, [supplierTieredMode]);

    const runVerify = useCallback(async () => {
        const id = companyId.trim();
        if (!id) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await apiJson(`${verifyApiUrl}?company_id=${encodeURIComponent(id)}&limit=100`);
            setVendorTab('all');
            setResult(data);
        } catch (e) {
            setError(e?.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    }, [companyId, verifyApiUrl]);

    const filteredRows = useMemo(() => {
        if (!result?.details) return [];
        let rows = result.details.filter(
            (r) => rowMatchesProductTab(r, productTab) && isComparableRow(r),
        );
        if (vendorTab !== 'all') rows = rows.filter((r) => String(r.vendor_id ?? '') === vendorTab);
        if (statusFilter === 'all') return rows;
        return rows.filter((r) => r.status === statusFilter);
    }, [result, productTab, statusFilter, vendorTab]);

    const vendorTabIds = useMemo(() => {
        if (!result?.details) return [];
        const ids = new Set();
        for (const r of result.details) {
            if (!rowMatchesProductTab(r, productTab) || !isComparableRow(r)) continue;
            if (r.vendor_id != null && r.vendor_id !== '') ids.add(String(r.vendor_id));
        }
        return [...ids].sort((a, b) => Number(a) - Number(b));
    }, [result, productTab]);

    const vendorTabCounts = useMemo(() => {
        const o = { all: 0 };
        if (!result?.details) return o;
        for (const r of result.details) {
            if (!rowMatchesProductTab(r, productTab) || !isComparableRow(r)) continue;
            o.all += 1;
            const vid = String(r.vendor_id ?? '');
            if (vid !== '') {
                if (!Object.prototype.hasOwnProperty.call(o, vid)) o[vid] = 0;
                o[vid] += 1;
            }
        }
        return o;
    }, [result, productTab]);

    /** Sorted by vendor, then stock id — one block per vendor (API returns up to `limit` rows per vendor × category). */
    const rowsGroupedByVendor = useMemo(() => {
        const sorted = [...filteredRows].sort((a, b) => {
            const va = Number(a.vendor_id);
            const vb = Number(b.vendor_id);
            if (Number.isFinite(va) && Number.isFinite(vb) && va !== vb) return va - vb;
            if (String(a.vendor_id) !== String(b.vendor_id)) return String(a.vendor_id).localeCompare(String(b.vendor_id));
            return String(a.stock_item_id ?? '').localeCompare(String(b.stock_item_id ?? ''));
        });
        const map = new Map();
        for (const r of sorted) {
            const key = r.vendor_id != null ? String(r.vendor_id) : '—';
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(r);
        }
        return [...map.entries()];
    }, [filteredRows]);

    const tabCounts = useMemo(() => {
        if (!result?.details) return {};
        const o = {};
        for (const t of PRODUCT_TABS) {
            o[t.id] = result.details.filter(
                (r) => rowMatchesProductTab(r, t.id) && isComparableRow(r),
            ).length;
        }
        return o;
    }, [result]);

    const marupTableColumns = useMemo(() => {
        const ident = (supplierMode) => [
            {
                key: 'status',
                header: 'Status',
                tdClassName: 'px-2 py-1.5',
                cell: (r) => (
                    <span
                        className={`font-medium capitalize ${
                            r.status === 'ok'
                                ? 'text-green-700 font-semibold'
                                : r.status === 'mismatch'
                                  ? 'text-red-600 font-semibold'
                                  : 'text-slate-700'
                        }`}
                    >
                        {r.status?.replace(/_/g, ' ')}
                    </span>
                ),
            },
            { key: 'vendor_id', header: 'vendor_id', tdClassName: 'px-2 py-1.5 font-mono tabular-nums', cell: (r) => r.vendor_id ?? '—' },
            { key: 'company_id', header: 'company_id', tdClassName: 'px-2 py-1.5 font-mono tabular-nums', cell: (r) => r.company_id ?? '—' },
            { key: 'stock_item_id', header: 'stock_item_id', tdClassName: 'px-2 py-1.5 font-mono tabular-nums', cell: (r) => r.stock_item_id ?? '—' },
            {
                key: 'updated',
                header: supplierMode ? 'Updated' : 'CSP updated',
                tdClassName: 'px-2 py-1.5 text-[10px] whitespace-nowrap text-slate-600',
                cell: (r) => formatUpdatedAt(r),
            },
        ];

        if (supplierTieredMode) {
            return [
                ...ident(true),
                {
                    key: 'total_sales',
                    header: 'Total sales',
                    tdClassName: 'px-2 py-1.5 tabular-nums',
                    cell: (r) => r.total_sales_price ?? '—',
                },
                {
                    key: 'supplier_type',
                    header: 'Supplier type',
                    tdClassName: 'px-2 py-1.5',
                    cell: (r) => r.supplier_rule_label ?? '—',
                },
                {
                    key: 'supplier_rule_val',
                    header: 'Rule value',
                    tdClassName: 'px-2 py-1.5',
                    cell: (r) => r.supplier_rule_value_display ?? '—',
                },
                {
                    key: 'supplier_amt',
                    header: 'Supplier $ (post)',
                    tdClassName: 'px-2 py-1.5 tabular-nums',
                    cell: (r) => formatMoneyCell(r.simp_markup_price),
                },
                {
                    key: 'exp_supplier',
                    header: 'Expected supplier $',
                    tdClassName: 'px-2 py-1.5 tabular-nums',
                    cell: (r) => formatMoneyCell(r.expected_simp_markup_price),
                },
                {
                    key: 'sup_layer',
                    header: 'Supplier layer',
                    tdClassName: 'px-2 py-1.5',
                    cell: (r) =>
                        r.supplier_layer_match == null ? '—' : r.supplier_layer_match ? 'OK' : 'Mismatch',
                },
                { key: 'tier_pct', header: 'Tier %', tdClassName: 'px-2 py-1.5 tabular-nums', cell: (r) => r.markup_percent ?? '—' },
                {
                    key: 'tier_type',
                    header: 'Tier type',
                    tdClassName: 'px-2 py-1.5 max-w-[100px] truncate',
                    cellTitle: (r) => r.markup_type,
                    cell: (r) => r.markup_type ?? '—',
                },
                { key: 'size', header: 'Size', tdClassName: 'px-2 py-1.5 tabular-nums', cell: (r) => r.size ?? '—' },
                {
                    key: 'expected',
                    header: 'Expected $',
                    tdClassName: 'px-2 py-1.5 tabular-nums',
                    cell: (r) => formatMoneyCell(r.expected_markup_price),
                },
                {
                    key: 'system',
                    header: 'System $',
                    tdClassName: 'px-2 py-1.5 tabular-nums',
                    cell: (r) => formatMoneyCell(r.system_markup_price),
                },
            ];
        }

        return [
            ...ident(false),
            {
                key: 'total_sales',
                header: 'Total sales',
                tdClassName: 'px-2 py-1.5 tabular-nums',
                cell: (r) => r.total_sales_price ?? '—',
            },
            { key: 'tier_pct', header: 'Tier %', tdClassName: 'px-2 py-1.5 tabular-nums', cell: (r) => r.markup_percent ?? '—' },
            {
                key: 'tier_type',
                header: 'Tier type',
                tdClassName: 'px-2 py-1.5 max-w-[100px] truncate',
                cellTitle: (r) => r.markup_type,
                cell: (r) => r.markup_type ?? '—',
            },
            { key: 'size', header: 'Size', tdClassName: 'px-2 py-1.5 tabular-nums', cell: (r) => r.size ?? '—' },
            {
                key: 'expected',
                header: 'Expected $',
                tdClassName: 'px-2 py-1.5 tabular-nums',
                cell: (r) => formatMoneyCell(r.expected_markup_price),
            },
            {
                key: 'system',
                header: 'System $',
                tdClassName: 'px-2 py-1.5 tabular-nums',
                cell: (r) => formatMoneyCell(r.system_markup_price),
            },
        ];
    }, [supplierTieredMode]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white flex flex-col">
            <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center px-4 sm:px-6 gap-3 shrink-0 z-10">
                <Link to="/" className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0" aria-label="Back to dashboard">
                    <ArrowLeft className="size-5 text-slate-600" />
                </Link>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0">
                        <Layers className="size-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Markup verification</h1>
                        <p className="text-xs text-slate-500 truncate">
                            {supplierTieredMode
                                ? 'inventory_permissions → stock_items → supplier markup → tier bands → company_supplier_inventory_markup_prices'
                                : 'inventory_permissions → vendor stock_items → company_stock_prices'}
                        </p>
                    </div>
                </div>
                <div className="flex-1" />
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                    <LogOut className="size-3.5" />
                    Logout
                </button>
            </header>

            <div className="flex flex-1 min-h-0">
                <aside className="w-56 shrink-0 border-r border-slate-200 bg-white hidden sm:flex flex-col">
                    <div className="px-3 py-3 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Markups</p>
                    </div>
                    <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
                        {MARKUP_NAV.map((item) => {
                            const Icon = item.icon || Database;
                            if (item.disabled) {
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 cursor-not-allowed"
                                        title="Coming later"
                                    >
                                        <Icon className="size-3.5 shrink-0 opacity-50" />
                                        <span>{item.label}</span>
                                        <span className="text-[10px] ml-auto">Soon</span>
                                    </div>
                                );
                            }
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.to}
                                    end={item.end === true}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-violet-50 text-violet-800 border border-violet-200/80'
                                                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                                        }`
                                    }
                                >
                                    <Icon className="size-3.5 shrink-0" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 min-w-0 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">
                                    {supplierTieredMode ? 'Supplier + tiered markup' : 'Tiered price markup'}
                                </h2>
                                {supplierTieredMode ? (
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Same <code className="text-[11px] bg-slate-100 px-1 rounded">inventory_permissions</code> and{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">stock_items</code> loading as tiered-only.
                                        Per‑vendor supplier percent comes from{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">company_supplier_price_markups</code>;
                                        tier rows still use your tier table (same as tiered flow).                                         Tier band &amp; tier % base come from{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">company_supplier_inventory_markup_prices.markup_price</code>{' '}
                                        (joined by company + vendor + stock_item).{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">base_price</code> is the pre-supplier amount;{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">markup_price</code> is post-supplier and is what tier % applies to.
                                        Carat/weight tiers band on{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">stock_items.size</code> and apply tier % to{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">simp.markup_price ÷ size</code>. Final tiered retail is compared against{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">company_stock_prices.markup_price</code>.
                                        If markup percents are stored scaled (e.g. hundredths), set backend{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">MARUP_SUPPLIER_MARKUP_SCALE</code>{' '}
                                        to <code className="text-[11px] bg-slate-100 px-1 rounded">hundredths</code> or{' '}
                                        <code className="text-[11px] bg-slate-100 px-1 rounded">basis_points</code>. Same row limits and Excel export behaviour as tiered-only.
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Active{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">inventory_permissions</code>{' '}
                                    rows (<code className="text-[11px] bg-slate-100 px-1 rounded">client_id</code> = company,{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">inventory_status</code> true) supply each{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">vendor_id</code> +{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">stock_type</code> (Jewelry / Gemstone / Diamond / LabGrown).
                                    Rows are fetched from{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">stock_items</code>{' '}
                                    for <em>that supplier</em> vendor — not the retailer company id — using{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">id, total_sales_price, size, type</code> (and{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">stock_num</code> for display).{' '}
                                    <strong>Natural diamond</strong> matches{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">type=&apos;Diamond&apos;</code> and{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">lab_grown</code> false (trimmed string or boolean).{' '}
                                    <strong>Lab grown</strong>: Diamond + lab grown true. Jewelry / Gemstone:{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">type</code> equals that name. For each{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">stock_items.id</code>, the app loads the latest{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">company_stock_prices</code> row where{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">stock_item_id = id</code> and compares{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">markup_price</code> to the tier from{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">company_price_markups</code>. Up to{' '}
                                    <strong>100</strong> rows per supplier <code className="text-[11px] bg-slate-100 px-1 rounded">vendor_id</code> × permitted{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">stock_type</code> batch (via{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">limit</code>).{' '}
                                    <strong>Download full inventory</strong> generates an Excel file with one worksheet per{' '}
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">vendor_id</code> plus a Summary sheet — it uses a higher per‑vendor row cap controlled on the server (
                                    <code className="text-[11px] bg-slate-100 px-1 rounded">MARUP_EXPORT_DEFAULT_LIMIT</code>).
                                </p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
                                <div className="flex-1 min-w-[160px]">
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Company ID</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={companyId}
                                        onChange={(e) => setCompanyId(e.target.value)}
                                        placeholder="e.g. 234124"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-mono focus:border-violet-400 focus:bg-white outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    disabled={loading || !companyId.trim()}
                                    onClick={runVerify}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50 shrink-0"
                                >
                                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                                    Run verification
                                </button>
                                <button
                                    type="button"
                                    disabled={loading || exporting || !companyId.trim()}
                                    onClick={handleDownloadInventory}
                                    title="Excel workbook with one worksheet per supplier (large batch)"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-5 py-2.5 text-sm font-semibold disabled:opacity-50 shrink-0"
                                >
                                    {exporting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Download className="size-4" />
                                    )}
                                    Download full inventory
                                </button>
                            </div>
                            {error && (
                                <p className="text-xs text-red-600 whitespace-pre-wrap break-words">{error}</p>
                            )}
                        </div>

                        {result && (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {[
                                        ['Stock rows (batch)', result.summary?.stockRowsExamined],
                                        ['Matched', result.summary?.matched],
                                        ['Mismatch', result.summary?.mismatch],
                                        ['Compared', result.summary?.compared],
                                        ...(supplierTieredMode
                                            ? [['Supplier layer mismatches', result.summary?.supplier_layer_mismatch]]
                                            : []),
                                    ].map(([label, val]) => (
                                        <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                                            <p className="text-lg font-bold text-slate-900 tabular-nums">{val ?? '—'}</p>
                                        </div>
                                    ))}
                                </div>
                                {supplierTieredMode && result.summary?.supplier_layer_verify_strict === false && (
                                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2">
                                        Supplier layer enforcement is disabled (
                                        <code className="text-[11px] bg-white/80 px-1 rounded">
                                            MARUP_SUPPLIER_LAYER_VERIFY
                                        </code>
                                        ). Status reflects tier and system price only; supplier layer columns are still shown for
                                        reference.
                                    </p>
                                )}
                                {result.summary?.noActiveInventoryPermissions && (
                                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 space-y-1">
                                        <p>
                                            No active inventory permissions found for{' '}
                                            <code className="text-[11px] bg-white/80 px-1 rounded">client_id = company</code>{' '}
                                            with{' '}
                                            <code className="text-[11px] bg-white/80 px-1 rounded">inventory_status</code>{' '}
                                            true — nothing to compare.
                                        </p>
                                        <p>
                                            Rows in{' '}
                                            <code className="text-[11px] bg-white/80 px-1 rounded">inventory_permissions</code>{' '}
                                            (active, distinct vendor × stock_type):{' '}
                                            <strong className="tabular-nums">
                                                {result.summary?.inventoryPermissionRowsTotal ?? 0}
                                            </strong>
                                            .
                                        </p>
                                        {Array.isArray(result.summary?.inventoryPermissionUnknownStockTypes)
                                            && result.summary.inventoryPermissionUnknownStockTypes.length > 0 && (
                                                <p>
                                                    Unrecognized{' '}
                                                    <code className="text-[11px] bg-white/80 px-1 rounded">stock_type</code>{' '}
                                                    values (skipped):{' '}
                                                    {result.summary.inventoryPermissionUnknownStockTypes
                                                        .slice(0, 8)
                                                        .map(
                                                            (r) =>
                                                                `vendor ${r.vendor_id}: ${JSON.stringify(r.stock_type)}`,
                                                        )
                                                        .join(' · ')}
                                                </p>
                                            )}
                                    </div>
                                )}
                                <p className="text-[11px] text-slate-500">
                                    {supplierTieredMode ? (
                                        <>
                                            Supplier rules:{' '}
                                            <code className="bg-slate-100 px-1 rounded">{result.supplierMarkupTable}</code>
                                            {' · '}
                                            SIMP table:{' '}
                                            <code className="bg-slate-100 px-1 rounded">{result.simpTable}</code>
                                            {' · '}
                                        </>
                                    ) : null}
                                    Tier table:{' '}
                                    <code className="bg-slate-100 px-1 rounded">{result.tieredPriceMarkupTable}</code>
                                    {typeof result.summary?.vendorCategoryPairs === 'number'
                                        ? ` · vendor/category batches: ${result.summary.vendorCategoryPairs}`
                                        : null}
                                    {result.detailsTruncated && (
                                        <span className="text-amber-700">
                                            {' '}
                                            · At least one vendor/category batch exceeds the row limit; raise{' '}
                                            <code className="bg-slate-100 px-1 rounded">?limit=</code> on the API.
                                        </span>
                                    )}
                                    {Array.isArray(result.summary?.vendorPremarkupInferred)
                                        && result.summary.vendorPremarkupInferred.length > 0
                                        && !supplierTieredMode ? (
                                            <span className="block mt-1 text-slate-600">
                                                Implicit pre‑markup add‑on (tier basis still uses{' '}
                                                <code className="bg-slate-100 px-1 rounded">total_sales_price</code> bands):{' '}
                                                {result.summary.vendorPremarkupInferred
                                                    .map(
                                                        ({ vendorId, categoryId, implicitAddon }) =>
                                                            `vendor ${vendorId} × ${categoryId}: +${implicitAddon}`,
                                                    )
                                                    .join(' · ')}
                                            </span>
                                        )
                                        : null}
                                </p>
                                {result.summary?.categories && (
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                        <span className="font-semibold text-slate-500">Stock by class (returned / total in DB): </span>
                                        {CATEGORY_DISPLAY_ORDER.map(({ key, label }) => {
                                            const v = result.summary.categories[key];
                                            if (!v) return null;
                                            return (
                                                <span key={key} className="mr-3 whitespace-nowrap">
                                                    <span className="font-medium">{label}</span>: {v.returned}/{v.totalInDb}
                                                    {v.truncated ? ' *' : ''}
                                                </span>
                                            );
                                        })}
                                    </p>
                                )}

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRODUCT_TABS.map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                        onClick={() => {
                                            setProductTab(t.id);
                                            setVendorTab('all');
                                        }}
                                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                                                    productTab === t.id
                                                        ? 'bg-violet-600 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {t.label}
                                                <span className="tabular-nums opacity-80"> ({tabCounts[t.id] ?? 0})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setVendorTab('all')}
                                            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                                                vendorTab === 'all'
                                                    ? 'bg-teal-600 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            All vendors
                                            <span className="tabular-nums opacity-80">
                                                {' '}
                                                ({vendorTabCounts.all ?? 0})
                                            </span>
                                        </button>
                                        {vendorTabIds.map((vid) => (
                                            <button
                                                key={vid}
                                                type="button"
                                                onClick={() => setVendorTab(vid)}
                                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold font-mono ${
                                                    vendorTab === vid
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {vid}
                                                <span className="tabular-nums opacity-80 font-sans">
                                                    {' '}
                                                    ({vendorTabCounts[vid] ?? 0})
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        Up to 100 rows per vendor × permitted stock_type from the API; filter one supplier at a time here.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compare status</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {STATUS_TABS.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setStatusFilter(t)}
                                                className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${
                                                    statusFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto max-h-[min(70vh,560px)] overflow-y-auto">
                                        <table className="w-full text-left text-[11px]">
                                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-[1]">
                                                <tr>
                                                    {marupTableColumns.map((col) => (
                                                        <th
                                                            key={col.key}
                                                            className="px-2 py-2 font-semibold text-slate-600 whitespace-nowrap"
                                                        >
                                                            {col.header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            {rowsGroupedByVendor.map(([vendorKey, vendorRows]) => (
                                                <tbody key={vendorKey} className="divide-y divide-slate-100">
                                                    <tr className="bg-slate-200/70">
                                                        <td
                                                            colSpan={marupTableColumns.length}
                                                            className="px-2 py-2 text-[11px] font-bold text-slate-700 whitespace-nowrap"
                                                        >
                                                            Vendor {vendorKey}
                                                            <span className="font-normal text-slate-500">
                                                                {' '}
                                                                · {vendorRows.length} row{vendorRows.length === 1 ? '' : 's'}
                                                                {typeof result.summary?.stockLimitPerCategory === 'number'
                                                                    ? ` (up to ${result.summary.stockLimitPerCategory} per vendor × category from API)`
                                                                    : ''}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {vendorRows.map((r, idx) => (
                                                        <tr
                                                            key={`${r.vendor_id ?? '-'}-${r.stock_item_id}-${r.simp_updated_at ?? r.csp_updated_at}-${r.status}-${idx}`}
                                                            className={
                                                                r.status === 'mismatch'
                                                                    ? 'bg-red-50/60'
                                                                    : r.status === 'ok'
                                                                      ? 'bg-emerald-50/45'
                                                                      : ''
                                                            }
                                                        >
                                                            {marupTableColumns.map((col) => (
                                                                <td
                                                                    key={col.key}
                                                                    className={col.tdClassName}
                                                                    title={col.cellTitle ? col.cellTitle(r) : undefined}
                                                                >
                                                                    {col.cell(r)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            ))}
                                        </table>
                                    </div>
                                    {filteredRows.length === 0 && (
                                        <p className="text-sm text-slate-500 text-center py-12">
                                            No comparable rows for this product / filter (skipped and rows without a stored compare price are hidden).
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="sm:hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500">
                            Full markup navigation is available on wider screens (sidebar).
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
