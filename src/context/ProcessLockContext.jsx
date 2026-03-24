import React, {
    createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useBlocker } from 'react-router-dom';

const ProcessLockContext = createContext(null);

export function ProcessLockProvider({ children }) {
    const [locked, setLocked] = useState(false);
    const value = useMemo(() => ({ locked, setLocked }), [locked]);
    return (
        <ProcessLockContext.Provider value={value}>
            {children}
            <NavigationBlocker />
        </ProcessLockContext.Provider>
    );
}

export function useProcessLock() {
    const ctx = useContext(ProcessLockContext);
    if (!ctx) {
        throw new Error('useProcessLock must be used within ProcessLockProvider');
    }
    return ctx;
}

function NavigationBlocker() {
    const { locked } = useProcessLock();
    const [toast, setToast] = useState('');

    const shouldBlock = useCallback(({ currentLocation, nextLocation }) => {
        if (!locked) return false;
        if (nextLocation.pathname === '/login') return false;
        return (
            currentLocation.pathname !== nextLocation.pathname
            || currentLocation.search !== nextLocation.search
            || currentLocation.hash !== nextLocation.hash
        );
    }, [locked]);

    const blocker = useBlocker(shouldBlock);

    useEffect(() => {
        if (blocker.state !== 'blocked') return;
        const { reset } = blocker;
        if (typeof reset !== 'function') return;
        setToast('Finish or stop the current task before leaving this page.');
        reset();
    }, [blocker]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(''), 5000);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        if (!locked) return undefined;
        const onBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [locked]);

    if (!toast) return null;
    return (
        <div className="fixed top-4 right-4 z-[100] max-w-sm rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 shadow-lg">
            {toast}
        </div>
    );
}
