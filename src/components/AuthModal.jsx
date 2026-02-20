import React, { useState } from 'react';
import { X, Eye, EyeOff, MapPin, Loader } from 'lucide-react';

/**
 * AuthModal
 * Props:
 *   onClose  () => void
 *   onAuth   (user) => void   — called with user object on success
 *   initialTab 'login' | 'signup'
 */
export default function AuthModal({ onClose, onAuth, initialTab = 'login' }) {
    const [tab, setTab] = useState(initialTab);
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirm: '',
    });

    const set = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setError('');
    };

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (tab === 'login') {
            if (!form.email || !form.password) {
                setError('Please fill in all fields.');
                return;
            }
            if (!isValidEmail(form.email)) {
                setError('Please enter a valid email address.');
                return;
            }
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                onAuth({ name: form.email.split('@')[0], email: form.email, initials: form.email.slice(0, 2).toUpperCase() });
            }, 1200);
        } else {
            if (!form.name || !form.email || !form.password || !form.confirm) {
                setError('Please fill in all required fields.');
                return;
            }
            if (!isValidEmail(form.email)) {
                setError('Please enter a valid email address.');
                return;
            }
            if (form.password !== form.confirm) {
                setError('Passwords do not match.');
                return;
            }
            if (form.password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                const initials = form.name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
                onAuth({ name: form.name, email: form.email, phone: form.phone, initials });
            }, 1400);
        }
    };

    const inputClass =
        'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm disabled:opacity-50';

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-8 pt-8 pb-6 border-b border-stone-100">
                    <div className="flex items-center gap-2 text-emerald-900" id="auth-modal-title">
                        <div className="bg-emerald-900 p-1.5 rounded-lg">
                            <MapPin className="text-white w-4 h-4" />
                        </div>
                        <span className="font-black text-lg">Chakabnb</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-full transition"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5 text-stone-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-100" role="tablist">
                    {['login', 'signup'].map((t) => (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={tab === t}
                            onClick={() => { setTab(t); setError(''); setForm({ name: '', email: '', phone: '', password: '', confirm: '' }); }}
                            className={`flex-1 py-3 text-sm font-bold transition ${tab === t
                                ? 'text-emerald-900 border-b-2 border-emerald-900'
                                : 'text-stone-400 hover:text-stone-700'
                                }`}
                        >
                            {t === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4" noValidate>
                    {tab === 'signup' && (
                        <>
                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    id="name"
                                    className={inputClass}
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={set('name')}
                                    disabled={loading}
                                    required
                                    aria-invalid={error.includes('fields')}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input
                            id="email"
                            className={inputClass}
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={set('email')}
                            disabled={loading}
                            required
                            aria-invalid={error.includes('email') || error.includes('fields')}
                        />
                    </div>

                    {tab === 'signup' && (
                        <div>
                            <label htmlFor="phone" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Phone (optional)</label>
                            <input
                                id="phone"
                                className={inputClass}
                                type="tel"
                                placeholder="+254 712 345 678"
                                value={form.phone}
                                onChange={set('phone')}
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                className={`${inputClass} pr-12`}
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={set('password')}
                                disabled={loading}
                                required
                                aria-invalid={error.includes('Password') || error.includes('fields')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((s) => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                                aria-label={showPw ? "Hide password" : "Show password"}
                                disabled={loading}
                            >
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {tab === 'signup' && (
                        <div>
                            <label htmlFor="confirm" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                            <input
                                id="confirm"
                                className={inputClass}
                                type="password"
                                placeholder="••••••••"
                                value={form.confirm}
                                onChange={set('confirm')}
                                disabled={loading}
                                required
                                aria-invalid={error.includes('match') || error.includes('fields')}
                            />
                        </div>
                    )}

                    {error && (
                        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 mt-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? (
                            <><Loader className="w-4 h-4 animate-spin" /> {tab === 'login' ? 'Signing in…' : 'Creating account…'}</>
                        ) : (
                            tab === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </button>

                    {tab === 'login' && (
                        <p className="text-center text-sm text-stone-400 mt-4">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => { setTab('signup'); setError(''); }}
                                className="text-emerald-700 font-bold hover:underline"
                                disabled={loading}
                            >
                                Sign up
                            </button>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
