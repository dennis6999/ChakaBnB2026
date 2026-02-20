import React, { useState } from 'react';
import {
    MapPin, Eye, EyeOff, Loader, ArrowLeft,
    Home, Star, ShieldCheck, Globe,
} from 'lucide-react';

import { api } from '../services/api.js';

/**
 * SignInPage — full-page authentication experience.
 * Props:
 *   initialTab  'login' | 'signup'
 *   onAuth      (user) => void
 *   navigateTo  (view) => void
 */
export default function SignInPage({ initialTab = 'login', onAuth, navigateTo }) {
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

    const switchTab = (t) => {
        setTab(t);
        setError('');
        setForm({ name: '', email: '', phone: '', password: '', confirm: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (tab === 'login') {
            if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
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
                setError('Please fill in all fields.'); return;
            }
            if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
            if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
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

    const inputCls =
        'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-900 ' +
        'placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';

    const stats = [
        { icon: Home, label: 'Properties', value: '2,400+' },
        { icon: Star, label: 'Guest Reviews', value: '18,000+' },
        { icon: Globe, label: 'Locations', value: '47 Cities' },
        { icon: ShieldCheck, label: 'Verified Hosts', value: '100%' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* ── LEFT PANEL (hero) ── */}
            <div className="hidden lg:flex flex-col flex-1 relative bg-emerald-950 text-white overflow-hidden">
                {/* Background gradient orbs */}
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-700/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl" />

                {/* Pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(
                            45deg,
                            #fff 0,
                            #fff 1px,
                            transparent 0,
                            transparent 50%
                        )`,
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full px-12 py-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="bg-orange-500 p-2 rounded-xl shadow-lg">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tight">ChakaBnB</span>
                    </div>

                    {/* Hero text */}
                    <div className="mt-auto mb-auto pt-20">
                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
                            Your next getaway awaits
                        </p>
                        <h1 className="text-5xl font-black leading-tight mb-6">
                            Find your perfect<br />
                            <span className="text-orange-400">home away</span><br />
                            from home.
                        </h1>
                        <p className="text-emerald-200/70 text-lg max-w-sm leading-relaxed">
                            Discover handpicked stays across Kenya — from serene lakeside retreats to vibrant city apartments.
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-4 pb-4">
                        {stats.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs text-emerald-300/70 font-medium">{label}</span>
                                </div>
                                <p className="text-xl font-black">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL (form) ── */}
            <div className="flex-1 lg:max-w-lg flex flex-col bg-white">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 sm:px-10 pt-8">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2">
                        <div className="bg-emerald-900 p-1.5 rounded-lg">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-lg text-emerald-900">ChakaBnB</span>
                    </div>

                    {/* Back to home */}
                    <button
                        onClick={() => navigateTo('home')}
                        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-emerald-800 font-semibold transition ml-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </button>
                </div>

                {/* Form container */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-10">
                    {/* Heading */}
                    <div className="mb-8 shrink-0">
                        <h2 className="text-3xl font-black text-stone-900 mb-1.5">
                            {tab === 'login' ? 'Welcome back 👋' : 'Create your account'}
                        </h2>
                        <p className="text-stone-500 text-sm">
                            {tab === 'login'
                                ? 'Sign in to manage your bookings and saved properties.'
                                : 'Join thousands of travellers discovering Kenya.'}
                        </p>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex bg-stone-100 rounded-2xl p-1 mb-7">
                        {[
                            { key: 'login', label: 'Sign In' },
                            { key: 'signup', label: 'Create Account' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => switchTab(key)}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${tab === key
                                    ? 'bg-white text-emerald-900 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Social auth buttons */}
                    <div className="mb-6">
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
                            className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-xl py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-xs text-stone-400 font-medium">or continue with email</span>
                        </div>
                    </div>

                    {/* Main form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {tab === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        className={inputCls}
                                        type="text"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={set('name')}
                                        autoComplete="name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                        Phone <span className="normal-case font-normal">(optional)</span>
                                    </label>
                                    <input
                                        className={inputCls}
                                        type="tel"
                                        placeholder="+254 712 345 678"
                                        value={form.phone}
                                        onChange={set('phone')}
                                        autoComplete="tel"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                className={inputCls}
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={set('email')}
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                                    Password
                                </label>
                                {tab === 'login' && (
                                    <button
                                        type="button"
                                        className="text-xs text-emerald-700 font-semibold hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    className={`${inputCls} pr-12`}
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={set('password')}
                                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((s) => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {tab === 'signup' && (
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                    Confirm Password
                                </label>
                                <input
                                    className={inputCls}
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirm}
                                    onChange={set('confirm')}
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    {tab === 'login' ? 'Signing in…' : 'Creating account…'}
                                </>
                            ) : (
                                tab === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>

                        {tab === 'login' ? (
                            <p className="text-center text-sm text-stone-400 pt-1">
                                Don&apos;t have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => switchTab('signup')}
                                    className="text-emerald-700 font-bold hover:underline"
                                >
                                    Sign up free
                                </button>
                            </p>
                        ) : (
                            <p className="text-center text-xs text-stone-400 leading-relaxed pt-1">
                                By creating an account you agree to our{' '}
                                <span className="text-emerald-700 font-semibold cursor-pointer hover:underline">Terms of Service</span>{' '}
                                and{' '}
                                <span className="text-emerald-700 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
