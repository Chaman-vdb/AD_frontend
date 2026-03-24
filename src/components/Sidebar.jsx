import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { NAV_SECTIONS } from '../constants.js';

const SECTION_ORDER = ['replication', 'create', 'sync'];

const sectionAccent = {
    replication: {
        activeBg: 'bg-blue-50',
        activeBorder: 'border-blue-600',
        activeText: 'text-blue-700',
        chevron: 'text-blue-500',
    },
    create: {
        activeBg: 'bg-emerald-50',
        activeBorder: 'border-emerald-600',
        activeText: 'text-emerald-800',
        chevron: 'text-emerald-600',
    },
    sync: {
        activeBg: 'bg-amber-50',
        activeBorder: 'border-amber-500',
        activeText: 'text-amber-800',
        chevron: 'text-amber-500',
    },
};

const overlay = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

const drawer = {
    initial: { x: '-100%' },
    animate: { x: 0, transition: { type: 'spring', damping: 28, stiffness: 300 } },
    exit: { x: '-100%', transition: { duration: 0.2, ease: 'easeIn' } },
};

function Sidebar({ isOpen, onClose, items, activeId, onSelect, disabled }) {
    const groupedSections = SECTION_ORDER.map((sid) => ({
        ...NAV_SECTIONS[sid],
        items: items.filter((i) => (i.section || 'sync') === sid),
    })).filter((g) => g.items.length > 0);

    const handleSelect = (id) => {
        if (disabled) return;
        onSelect(id);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        {...overlay}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.aside
                        {...drawer}
                        className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Workflows</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{disabled ? 'Locked — a process is running' : 'Select an automation task'}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="size-5 text-slate-500" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto py-3">
                            {groupedSections.map((section, sIdx) => (
                                <div key={section.id} className={sIdx > 0 ? 'mt-5' : ''}>
                                    <div className="px-4 mb-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                            {section.title}
                                        </p>
                                    </div>
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = item.id === activeId;
                                        const accent = sectionAccent[item.section] || sectionAccent.sync;
                                        const isCompact = item.section === 'sync';
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item.id)}
                                                disabled={disabled}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-5 text-left transition-all',
                                                    isCompact ? 'py-2.5' : 'py-3',
                                                    isActive
                                                        ? cn(accent.activeBg, 'border-r-3', accent.activeBorder)
                                                        : 'hover:bg-slate-50 border-r-3 border-transparent',
                                                    disabled && 'opacity-50 cursor-not-allowed'
                                                )}
                                            >
                                                <div className={cn('p-1.5 rounded-lg', item.iconBg || 'bg-slate-100')}>
                                                    <Icon className={cn(isCompact ? 'size-3.5' : 'size-4', item.iconColor || 'text-slate-600')} strokeWidth={2} />
                                                </div>
                                                <span className={cn(
                                                    isCompact ? 'text-xs leading-tight' : 'text-sm',
                                                    'font-medium flex-1',
                                                    isActive ? accent.activeText : 'text-slate-700'
                                                )}>
                                                    {item.label}
                                                </span>
                                                {isActive && <ChevronRight className={cn(isCompact ? 'size-3.5' : 'size-4', accent.chevron)} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>

                        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-[10px] text-slate-400 text-center">VDB Automation Dashboard</p>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

function SidebarTrigger({ onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all',
                className
            )}
        >
            <Menu className="size-5 text-slate-700" strokeWidth={2} />
        </button>
    );
}

export { Sidebar, SidebarTrigger };
