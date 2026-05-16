import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import RunDetailPage from './pages/RunDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MarupVerificationPage from './pages/MarupVerificationPage.jsx';
import { ProcessLockProvider } from './context/ProcessLockContext.jsx';
import { apiFetch } from './lib/api.js';
import './index.css';

/**
 * Single layout for all protected routes — stays mounted when you move between /, /history, etc.
 * Uses createBrowserRouter so useBlocker (process lock) works app-wide.
 */
function RequireAuthLayout() {
    const [loading, setLoading] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const authCheckSeq = React.useRef(0);

    React.useEffect(() => {
        const seq = ++authCheckSeq.current;
        let cancelled = false;

        apiFetch('/api/auth/me')
            .then((res) => {
                if (cancelled || seq !== authCheckSeq.current) return;
                setIsAuthenticated(res.ok);
                setLoading(false);
            })
            .catch(() => {
                if (cancelled || seq !== authCheckSeq.current) return;
                setIsAuthenticated(false);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
                Checking session...
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
        <ProcessLockProvider>
            <Outlet />
        </ProcessLockProvider>
    );
}

const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    {
        path: '/',
        element: <RequireAuthLayout />,
        children: [
            { index: true, element: <App /> },
            { path: 'marup-verification', element: <MarupVerificationPage /> },
            { path: 'marup-verification/supplier-tiered', element: <MarupVerificationPage /> },
            { path: 'history', element: <HistoryPage /> },
            { path: 'history/:runId', element: <RunDetailPage /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
