import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import App from './App.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import RunDetailPage from './pages/RunDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { apiFetch } from './lib/api.js';
import './index.css';

function RequireAuth({ children }) {
    const location = useLocation();
    const [loading, setLoading] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    React.useEffect(() => {
        let active = true;
        apiFetch('/api/auth/me')
            .then((res) => {
                if (!active) return;
                setIsAuthenticated(res.ok);
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setIsAuthenticated(false);
                setLoading(false);
            });
        return () => { active = false; };
    }, [location.pathname]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Checking session...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<RequireAuth><App /></RequireAuth>} />
                <Route path="/history" element={<RequireAuth><HistoryPage /></RequireAuth>} />
                <Route path="/history/:runId" element={<RequireAuth><RunDetailPage /></RequireAuth>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
