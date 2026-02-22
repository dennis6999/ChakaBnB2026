import React, { useState, useEffect } from 'react';
import { MapPin, Search, User, Home, Heart, History, LogIn, PlusCircle } from 'lucide-react';

/**
 * Mobile-aware Navbar with fixed bottom navigation for small screens.
 * Props: navigateTo, bookingCount, hostBookingCount, user, onAuthClick, onSignOut
 */
export default function Navbar({ navigateTo, bookingCount, hostBookingCount = 0, user, onAuthClick, onSignOut }) {
    // We can track active path using window.location.pathname if we used React Router, 
    // but here we just pass a simple active state or rely on App.jsx state if it was passed.
    // For now, we'll let the user tap and just route.
    const go = (view, id = null, tab = null) => { navigateTo(view, id, tab); };

    return (
        <>
            {/* Top Navigation Bar - Sticky */}
            <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm py-4 px-4 border-b border-stone-200">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-10">
                    {/* Logo - Always visible */}
                    <div
                        onClick={() => go('home')}
                        className="text-2xl font-black text-emerald-900 tracking-tighter flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    >
                        <div className="bg-emerald-900 p-1.5 rounded-lg">
                            <MapPin className="text-white w-6 h-6" />
                        </div>
                        Chakabnb
                    </div>

                    {/* Desktop actions (Hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-4 text-emerald-900 font-medium text-sm">
                        <span className="cursor-pointer hover:bg-stone-100 px-3 py-2 rounded-full transition text-stone-600">
                            KES / 🇰🇪
                        </span>
                        <button
                            onClick={() => go('search')}
                            className="flex items-center gap-2 hover:bg-stone-100 px-4 py-2 rounded-full transition"
                        >
                            <Search className="w-4 h-4" /> Explore
                        </button>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => go('host')}
                                    className="hidden lg:block relative text-sm font-bold text-stone-600 hover:text-emerald-900 transition mr-4"
                                >
                                    Switch to hosting
                                    {hostBookingCount > 0 && (
                                        <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                            {hostBookingCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => go('profile')}
                                    className="bg-emerald-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-800 transition shadow-md font-semibold flex items-center gap-2"
                                >
                                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-black">{user.initials}</span>
                                    <span>{user.name}</span>
                                    {bookingCount > 0 && (
                                        <span className="bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                            {bookingCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onAuthClick}
                                className="bg-emerald-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-800 transition shadow-md font-semibold flex items-center gap-2"
                            >
                                <User className="w-4 h-4" /> Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile top-right action (Optional, keep clean since we have bottom nav) */}
                    <div className="flex md:hidden items-center">
                        <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">KES</span>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation Bar - Fixed */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 px-2 pb-safe pt-2 shadow-2xl flex justify-around items-center h-[72px]">
                <button
                    onClick={() => go('search')}
                    className="flex flex-col items-center justify-center w-14 h-12 text-stone-500 hover:text-emerald-700 transition"
                >
                    <Search className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Explore</span>
                </button>

                <button
                    onClick={() => go('profile', null, 'saved')}
                    className="flex flex-col items-center justify-center w-14 h-12 text-stone-500 hover:text-emerald-700 transition"
                >
                    <Heart className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Saved</span>
                </button>

                {user && (
                    <button
                        onClick={() => go('host')}
                        className="relative flex flex-col items-center justify-center w-14 h-12 text-stone-500 hover:text-emerald-700 transition"
                    >
                        <PlusCircle className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">Host</span>
                        {hostBookingCount > 0 && (
                            <span className="absolute top-0 right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                {hostBookingCount}
                            </span>
                        )}
                    </button>
                )}

                <button
                    onClick={() => go('profile', null, 'trips')}
                    className="relative flex flex-col items-center justify-center w-14 h-12 text-stone-500 hover:text-emerald-700 transition"
                >
                    <History className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Trips</span>
                    {bookingCount > 0 && (
                        <span className="absolute top-0 right-2 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                            {bookingCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => user ? go('profile', null, 'account') : onAuthClick()}
                    className="flex flex-col items-center justify-center w-14 h-12 text-stone-500 hover:text-emerald-700 transition"
                >
                    {user ? (
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-black mb-1">
                            {user.initials}
                        </div>
                    ) : (
                        <User className="w-6 h-6 mb-1" />
                    )}
                    <span className="text-[10px] font-bold">{user ? 'Profile' : 'Log in'}</span>
                </button>
            </nav>
        </>
    );
}
