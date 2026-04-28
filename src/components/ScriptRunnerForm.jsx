import React, { useState } from 'react';
import { Label } from './ui/Label.jsx';
import { Input } from './ui/Input.jsx';
import { Button } from './ui/Button.jsx';
import { Loader2, Play, Hash } from 'lucide-react';

const SCRIPT_FIELDS = {
    copyCustomSearchMenus: {
        title: 'Copy Custom Search Menus',
        description: 'Copies custom search menu types (with images) and menus from one org or company to another.',
        dualScopeSelector: true,
        fields: [
            { key: 'sourceId', label: 'Source Org ID', placeholder: 'e.g. 799' },
            { key: 'targetId', label: 'Target Org ID', placeholder: 'e.g. 945' },
        ],
    },
    copyOrgWhiteLabel: {
        title: 'Copy White Label',
        description: 'Copies white label configurations (theme_white_labelings) from one org to another.',
        fields: [
            { key: 'sourceOrgId', label: 'Source Org ID', placeholder: 'e.g. 832' },
            { key: 'targetOrgId', label: 'Target Org ID', placeholder: 'e.g. 945' },
        ],
    },
    copyCustomizations: {
        title: 'Copy customizations',
        description:
            'Copies selected sections between organizations, companies, and/or users: global texts, custom texts, JSON nav menu, and optionally PDP / search / unified layout rows. Source and target entity types can differ (e.g. org → company, org → user).',
        customizationEntityScopes: true,
        fields: [
            { key: 'sourceId', label: 'Source ID', placeholder: 'e.g. 832' },
            { key: 'targetId', label: 'Target ID', placeholder: 'e.g. 945' },
        ],
    },
    copyCustomDataAndValues: {
        title: 'Copy Custom Data Headers & Values',
        description: 'Copies custom_data_headers and custom_data_values from one company to another.',
        fields: [
            { key: 'sourceCompanyId', label: 'Source Company ID', placeholder: 'e.g. 218571' },
            { key: 'targetCompanyId', label: 'Target Company ID', placeholder: 'e.g. 218572' },
        ],
    },
    testFeatureActivation: {
        title: 'Test Feature Activation',
        description: 'Tests the API-based feature activation by copying active features between companies.',
        fields: [
            { key: 'sourceCompanyId', label: 'Source Company ID', placeholder: 'e.g. 39416' },
            { key: 'targetCompanyId', label: 'Target Company ID', placeholder: 'e.g. 91268' },
        ],
    },
    testCustomizations: {
        title: 'Test Customizations',
        description: 'Fetches customizations from source org and runs the customizations spec(PDP, SearchResult, SearchForm) against the target.',
        fields: [
            { key: 'sourceOrgId', label: 'Source Org ID', placeholder: 'e.g. 577' },
            { key: 'targetOrgId', label: 'Target Org ID', placeholder: 'e.g. 1008' },
        ],
    },
    importCustomSearchMenusFromSheet: {
        title: 'Import Custom Search Menus From Sheet',
        description:
            'Imports custom search menu types and menus from an .xlsx file. SVG/PNG columns may be local paths or direct HTTPS URLs (e.g. CDN assets).',
        fields: [
            { key: 'targetOrgId', label: 'Target Org ID', placeholder: 'e.g. 380' },
            {
                key: 'xlsxPath',
                label: 'XLSX Path',
                placeholder: 'Local path on the server, or upload via file picker below',
            },
            { key: 'sheetName', label: 'Sheet Name (optional)', placeholder: 'e.g. Sheet4', required: false },
        ],
    },
};

function ScriptRunnerForm({ scriptKey, isRunning, onSubmit }) {
    const config = SCRIPT_FIELDS[scriptKey];
    const [values, setValues] = useState({});
    const [scope, setScope] = useState('org');
    const [sourceScope, setSourceScope] = useState('org');
    const [targetScope, setTargetScope] = useState('org');
    const [customizationSourceScope, setCustomizationSourceScope] = useState('org');
    const [customizationTargetScope, setCustomizationTargetScope] = useState('org');

    if (!config) return null;

    const activeFields = config.customizationEntityScopes
        ? [
            {
                key: 'sourceId',
                label:
                    customizationSourceScope === 'company'
                        ? 'Source Company ID'
                        : customizationSourceScope === 'user'
                          ? 'Source User ID'
                          : 'Source Org ID',
                placeholder:
                    customizationSourceScope === 'company'
                        ? 'e.g. 39416'
                        : customizationSourceScope === 'user'
                          ? 'e.g. 120883'
                          : 'e.g. 832',
            },
            {
                key: 'targetId',
                label:
                    customizationTargetScope === 'company'
                        ? 'Target Company ID'
                        : customizationTargetScope === 'user'
                          ? 'Target User ID'
                          : 'Target Org ID',
                placeholder:
                    customizationTargetScope === 'company'
                        ? 'e.g. 91268'
                        : customizationTargetScope === 'user'
                          ? 'e.g. 120884'
                          : 'e.g. 945',
            },
        ]
        : config.dualScopeSelector
        ? [
            {
                key: 'sourceId',
                label: sourceScope === 'company' ? 'Source Company ID' : 'Source Org ID',
                placeholder: sourceScope === 'company' ? 'e.g. 39416' : 'e.g. 500',
            },
            {
                key: 'targetId',
                label: targetScope === 'company' ? 'Target Company ID' : 'Target Org ID',
                placeholder: targetScope === 'company' ? 'e.g. 91549' : 'e.g. 945',
            },
        ]
        : config.scopeSelector
        ? (config.fieldsByScope?.[scope] || config.fields)
        : config.fields;

    const allFilled = activeFields.every((f) => {
        if (f.required === false) return true;
        return (values[f.key] || '').trim();
    });
    const canSubmit = allFilled && !isRunning;

    const handleChange = (key, val) => {
        setValues(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const args = activeFields
            .map((f) => ({ ...f, value: (values[f.key] || '').trim() }))
            .filter((f) => !(f.required === false && !f.value))
            .map((f) => f.value);
        if (config.customizationEntityScopes) {
            const sourceId = args[0];
            const targetId = args[1];
            args.length = 0;
            args.push(
                customizationSourceScope,
                sourceId,
                customizationTargetScope,
                targetId,
                'global,custom_texts,json_navigation_menu',
            );
        } else if (config.dualScopeSelector) {
            args.push(sourceScope, targetScope);
        } else if (config.scopeSelector) {
            args.push(scope);
        }
        onSubmit({ script: scriptKey, args });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
                <p className="text-sm text-amber-800">{config.description}</p>
            </div>

            {config.customizationEntityScopes && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-50 text-amber-600">
                            <Hash className="size-3.5" />
                        </div>
                        Source entity
                    </Label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setCustomizationSourceScope('org')}
                            className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                                customizationSourceScope === 'org'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Org
                        </button>
                        <button
                            type="button"
                            onClick={() => setCustomizationSourceScope('company')}
                            className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                                customizationSourceScope === 'company'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Company
                        </button>
                        <button
                            type="button"
                            onClick={() => setCustomizationSourceScope('user')}
                            className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                                customizationSourceScope === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            User
                        </button>
                    </div>
                    <Label className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-50 text-amber-600">
                            <Hash className="size-3.5" />
                        </div>
                        Target entity
                    </Label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setCustomizationTargetScope('org')}
                            className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                                customizationTargetScope === 'org'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Org
                        </button>
                        <button
                            type="button"
                            onClick={() => setCustomizationTargetScope('company')}
                            className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                                customizationTargetScope === 'company'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Company
                        </button>
                        <button
                            type="button"
                            onClick={() => setCustomizationTargetScope('user')}
                            className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                                customizationTargetScope === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            User
                        </button>
                    </div>
                </div>
            )}

            {config.dualScopeSelector && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-50 text-amber-600">
                            <Hash className="size-3.5" />
                        </div>
                        Source Scope
                    </Label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setSourceScope('org')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                                sourceScope === 'org'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Organization
                        </button>
                        <button
                            type="button"
                            onClick={() => setSourceScope('company')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                                sourceScope === 'company'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Company
                        </button>
                    </div>
                    <Label className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-50 text-amber-600">
                            <Hash className="size-3.5" />
                        </div>
                        Target Scope
                    </Label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setTargetScope('org')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                                targetScope === 'org'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Organization
                        </button>
                        <button
                            type="button"
                            onClick={() => setTargetScope('company')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                                targetScope === 'company'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Company
                        </button>
                    </div>
                </div>
            )}

            {config.scopeSelector && !config.dualScopeSelector && !config.customizationEntityScopes && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-50 text-amber-600">
                            <Hash className="size-3.5" />
                        </div>
                        Scope
                    </Label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setScope('org')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                                scope === 'org'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Organization
                        </button>
                        <button
                            type="button"
                            onClick={() => setScope('company')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                                scope === 'company'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Company
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                        <Label htmlFor={`sr-${field.key}`} className="flex items-center gap-2">
                            <div className="p-1 rounded bg-amber-50 text-amber-600">
                                <Hash className="size-3.5" />
                            </div>
                            {field.label}
                        </Label>
                        <Input
                            id={`sr-${field.key}`}
                            placeholder={field.placeholder}
                            value={values[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className="bg-white/80"
                        />
                    </div>
                ))}
            </div>

            <Button
                type="submit"
                disabled={!canSubmit}
                size="lg"
                className="mt-3 w-full bg-amber-600 hover:bg-amber-700 border-amber-700"
            >
                {isRunning ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Running...
                    </>
                ) : (
                    <>
                        <Play className="size-4" />
                        Run Script
                    </>
                )}
            </Button>

            {!canSubmit && !isRunning && (
                <p className="text-xs text-center text-muted-foreground">
                    Fill in all fields to proceed
                </p>
            )}
        </form>
    );
}

export default ScriptRunnerForm;
export { SCRIPT_FIELDS };
