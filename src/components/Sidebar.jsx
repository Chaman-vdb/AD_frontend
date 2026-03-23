import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils.js";

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const drawer = {
  initial: { x: "-100%" },
  animate: {
    x: 0,
    transition: { type: "spring", damping: 28, stiffness: 300 },
  },
  exit: { x: "-100%", transition: { duration: 0.2, ease: "easeIn" } },
};

const CATEGORIES = [
  {
    key: "replication",
    label: "Replication",
    activeBg: "bg-blue-50",
    activeBorder: "border-blue-600",
    activeText: "text-blue-700",
    activeChevron: "text-blue-500",
  },
  {
    key: "copy",
    label: "Copy",
    activeBg: "bg-amber-50",
    activeBorder: "border-amber-500",
    activeText: "text-amber-700",
    activeChevron: "text-amber-500",
  },
  {
    key: "create",
    label: "Create",
    activeBg: "bg-emerald-50",
    activeBorder: "border-emerald-500",
    activeText: "text-emerald-700",
    activeChevron: "text-emerald-500",
  },
];

function Sidebar({ isOpen, onClose, items, activeId, onSelect, disabled }) {
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
                <h2 className="text-base font-bold text-slate-900">
                  Workflows
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {disabled
                    ? "Locked — a process is running"
                    : "Select an automation task"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="size-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              {CATEGORIES.map((cat, catIdx) => {
                const catItems = items.filter((i) => i.category === cat.key);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat.key}>
                    <div className={cn("px-4 mb-2", catIdx > 0 && "mt-5")}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        {cat.label}
                      </p>
                    </div>
                    {catItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id === activeId;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.id)}
                          disabled={disabled}
                          className={cn(
                            "w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all",
                            isActive
                              ? `${cat.activeBg} border-r-3 ${cat.activeBorder}`
                              : "hover:bg-slate-50 border-r-3 border-transparent",
                            disabled && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <div
                            className={cn(
                              "p-1.5 rounded-lg",
                              item.iconBg || "bg-slate-100",
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-3.5",
                                item.iconColor || "text-slate-600",
                              )}
                              strokeWidth={2}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium flex-1 leading-tight",
                              isActive ? cat.activeText : "text-slate-600",
                            )}
                          >
                            {item.label}
                          </span>
                          {isActive && (
                            <ChevronRight
                              className={cn("size-3.5", cat.activeChevron)}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-[10px] text-slate-400 text-center">
                VDB Automation Dashboard
              </p>
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
        "p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all",
        className,
      )}
    >
      <Menu className="size-5 text-slate-700" strokeWidth={2} />
    </button>
  );
}

export { Sidebar, SidebarTrigger };
