import React from 'react';
import { MapPin, Search, Home } from 'lucide-react';

export default function NotFoundPage({ navigateTo }) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 bg-stone-50">
            <div className="text-center max-w-md">
                <div className="text-8xl font-black text-stone-200 mb-4 leading-none select-none">404</div>
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-8 h-8 text-emerald-700" />
                </div>
                <h1 className="text-2xl font-black text-stone-900 mb-3">You've gone off the map!</h1>
                <p className="text-stone-500 mb-8">
                    This page doesn't exist. Let's get you back to discover beautiful stays in Chaka.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigateTo('home')}
                        className="flex items-center gap-2 bg-emerald-900 text-white font-bold px-5 py-3 rounded-xl hover:bg-emerald-800 transition shadow-md"
                    >
                        <Home className="w-4 h-4" /> Go Home
                    </button>
                    <button
                        onClick={() => navigateTo('search')}
                        className="flex items-center gap-2 border-2 border-stone-200 text-stone-700 font-bold px-5 py-3 rounded-xl hover:bg-stone-100 transition"
                    >
                        <Search className="w-4 h-4" /> Explore Stays
                    </button>
                </div>
            </div>
        </div>
    );
}
