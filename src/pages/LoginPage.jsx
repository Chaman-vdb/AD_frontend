import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { apiJson, apiFetch } from '../lib/api.js';
import { normalizeTargetEnvironmentResponse } from '../lib/targetEnvironment.js';
import EnvironmentSelect from '../components/EnvironmentSelect.jsx';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [targetEnvironment, setTargetEnvironment] = useState(null);

    useEffect(() => {
        apiFetch('/api/target-environment/public')
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                const normalized = normalizeTargetEnvironmentResponse(data);
                if (normalized) setTargetEnvironment(normalized);
            })
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        setSubmitting(true);
        setError('');
        try {
            await apiJson('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            navigate('/', { replace: true });
        } catch {
            setError('Invalid email or password.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-start gap-2 border-b border-slate-100 px-5 py-4">
                    <div className="p-1.5 rounded-lg bg-blue-50 shrink-0">
                        <KeyRound className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-bold text-slate-900">Automation Dashboard Login</h1>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Target is shared for all users. Change it from the header after you sign in.
                        </p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-slate-500">VDB target</span>
                            <span className="text-[10px] text-slate-400">read-only here</span>
                        </div>
                        {targetEnvironment?.options?.length ? (
                            <EnvironmentSelect
                                current={targetEnvironment.current}
                                options={targetEnvironment.options}
                                disabled
                                className="w-full [&_select]:max-w-none [&_select]:w-full"
                            />
                        ) : (
                            <p className="text-[11px] text-slate-400">Loading target…</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting || !email.trim() || !password.trim()}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {submitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
