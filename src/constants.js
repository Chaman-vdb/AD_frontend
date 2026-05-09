import {
    Building, Building2, FileCode, Copy, Palette, Zap, FlaskConical, KeyRound, FileSpreadsheet, UserCog, User,
} from 'lucide-react';

/** Sidebar grouping: replication (clone env), create (data & access), sync (copy between existing). */
export const NAV_SECTIONS = {
    replication: { id: 'replication', title: 'Replication' },
    create: { id: 'create', title: 'Create & import' },
    sync: { id: 'sync', title: 'Copy & sync' },
};

export const NAV_ITEMS = [
    { id: 'org', section: 'replication', label: ' Organization', icon: Building2, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
    { id: 'company', section: 'replication', label: 'Company', icon: Building, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { id: 'script-import-search-menus-sheet', section: 'create', label: 'Import custom menus from sheet', icon: FileCode, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', scriptKey: 'importCustomSearchMenusFromSheet' },
    { id: 'bulk-users-sheet', section: 'create', label: 'Bulk users (Excel/CSV)', icon: FileSpreadsheet, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700' },
    { id: 'inventory-permissions', section: 'create', label: 'Inventory API Permissions', icon: KeyRound, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-700' },
    { id: 'server-admin', section: 'create', label: 'Server admin', icon: UserCog, iconBg: 'bg-violet-100', iconColor: 'text-violet-700' },
    { id: 'single-user-http', section: 'create', label: 'App User', icon: User, iconBg: 'bg-sky-100', iconColor: 'text-sky-700' },
    { id: 'script-copy-search-menus', section: 'sync', label: 'Custom Search Menus', icon: Copy, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', scriptKey: 'copyCustomSearchMenus' },
    { id: 'script-copy-white-label', section: 'sync', label: 'White Label', icon: Palette, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', scriptKey: 'copyOrgWhiteLabel' },
    { id: 'script-copy-customizations', section: 'sync', label: ' Customizations (org / company / user)', icon: FileCode, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', scriptKey: 'copyCustomizations' },
    { id: 'script-copy-custom-data', section: 'sync', label: ' Custom Data & Values', icon: FileCode, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', scriptKey: 'copyCustomDataAndValues' },
    { id: 'script-test-features', section: 'sync', label: 'Company Feature Switches', icon: Zap, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', scriptKey: 'testFeatureActivation' },
];

export const STEP_DEFS = {
    org: [
        { id: 'fetch-data', label: 'Fetch Production Data' },
        { id: 'validate-names', label: 'Validate Names' },
        { id: 'create-org', label: 'Create Organization' },
        { id: 'apply-settings', label: 'Apply Org Settings' },
        { id: 'create-company', label: 'Create Company + Features' },
        { id: 'copy-customizations-api', label: 'Copy Customizations (API)' },
        { id: 'copy-white-label', label: 'Copy White Label' },
        { id: 'copy-search-menus', label: 'Copy Search Menus' },
        { id: 'validate-finalize', label: 'Validate & Finalize' },
    ],
    company: [
        { id: 'verify-org', label: 'Verify Target Organization' },
        { id: 'validate-name', label: 'Validate Company Name' },
        { id: 'fetch-source', label: 'Fetch Source Company Data' },
        { id: 'run-spec', label: 'Run Company Replication (Playwright)' },
        { id: 'lookup-id', label: 'Lookup New Company ID' },
    ],
    inventoryPermissions: [
        { id: 'validate-fields', label: 'Validate Input Fields' },
        { id: 'run-spec', label: 'Create API Client / Inventory Permissions' },
    ],
    copyCustomSearchMenus: [
        { id: 'init', label: 'Initialize' },
        { id: 'run', label: 'Copy Search Menu Types & Menus' },
    ],
    copyOrgWhiteLabel: [
        { id: 'init', label: 'Initialize' },
        { id: 'run', label: 'Copy White Label Configs' },
    ],
    copyCustomizations: [
        { id: 'init', label: 'Initialize' },
        { id: 'run', label: 'Copy selected sections' },
    ],
    copyCustomDataAndValues: [
        { id: 'init', label: 'Initialize' },
        { id: 'run', label: 'Copy Custom Data Headers & Values' },
    ],
    testFeatureActivation: [
        { id: 'init', label: 'Initialize' },
        { id: 'run', label: 'Activate Features on Target' },
    ],
    testCustomizations: [
        { id: 'init', label: 'Initialize' },
        { id: 'run', label: 'Run Customizations Spec' },
    ],
    importCustomSearchMenusFromSheet: [
        { id: 'init', label: 'Initialize' },
        { id: 'run', label: 'Import from Sheet' },
    ],
    bulkUsersSheet: [
        { id: 'upload-run', label: 'POST create users + DB lookup + email verified' },
    ],
    serverAdmin: [
        { id: 'validate-fields', label: 'Validate Input Fields' },
        { id: 'create-server-admin', label: 'POST /superadmin/admin_users' },
    ],
    singleUserHttp: [
        { id: 'validate-fields', label: 'Validate Input Fields' },
        { id: 'post-superadmin-user', label: 'POST /superadmin/users' },
        { id: 'verify-email-patch', label: 'Verify email (PATCH user)' },
    ],
};

export const sideInput = 'w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400';
export const sideLabel = 'text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block';

export const fadeIn = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};
