import React, { useState } from 'react';
import { X, Eye, EyeOff, MapPin, Loader } from 'lucide-react';
import { api } from '../services/api.js';

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

    const handleSubmit = async (e) => {
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
            try {
                const user = await api.login(form.email, form.password);
                onAuth(user);
            } catch (err) {
                setError(err.message || 'Failed to sign in. Please check your credentials.');
            } finally {
                setLoading(false);
            }
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
            try {
                const user = await api.signup(form.name, form.email, form.password);
                onAuth(user);
            } catch (err) {
                setError(err.message || 'Failed to create account. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const inputClass =
        'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm disabled:opacity-50';

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-8 pt-8 pb-6 border-b border-stone-100 shrink-0">
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

                {/* Form Content - Scrollable */}
                <div className="overflow-y-auto px-8 py-6">
                    {/* Google Auth Button */}
                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await api.signInWithGoogle();
                            } catch (err) {
                                setError('Failed to connect to Google.');
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="w-full bg-white border border-stone-200 text-stone-700 font-bold py-3.5 rounded-xl transition hover:bg-stone-50 flex items-center justify-center gap-3 mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-stone-500 font-medium">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
        </div>
    );
}
