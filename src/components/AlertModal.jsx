import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function AlertModal({ isOpen, title, message, type = 'error', onClose }) {
    if (!isOpen) return null;

    const isError = type === 'error';

    return (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 text-center pt-8 pb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${isError ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                        {isError ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                        {title || (isError ? 'Oops!' : 'Success!')}
                    </h3>
                    <p className="text-stone-600 font-medium mb-8">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className={`w-full font-bold py-3.5 rounded-xl transition shadow-lg ${isError
                                ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20'
                                : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-700/20'
                            }`}
                    >
                        Okay
                    </button>
                </div>
            </div>
        </div>
    );
}
