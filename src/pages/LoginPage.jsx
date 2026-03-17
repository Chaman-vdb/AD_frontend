import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { apiJson } from '../lib/api.js';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

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
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                    <div className="p-1.5 rounded-lg bg-blue-50">
                        <KeyRound className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-sm font-bold text-slate-900">Automation Dashboard Login</h1>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-700">
                        PROD
                    </span>
                </div>
                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
                        <span className="text-[11px] font-semibold text-slate-500">Server</span>
                        <span className="text-[11px] font-semibold text-orange-700">Production</span>
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
