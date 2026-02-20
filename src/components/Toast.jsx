import React from 'react';
import { Check, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-900/20 flex items-center gap-4 z-[110] animate-in slide-in-from-bottom-5">
            <div className="bg-emerald-800 rounded-full p-1.5 border border-emerald-700">
                <Check className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="font-medium text-base">{message}</span>
            <button onClick={onClose} className="ml-2 text-emerald-400 hover:text-white transition">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
