import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * GalleryLightbox
 * Props:
 *   images    string[]   – array of image URLs
 *   startIdx  number     – which image to open on
 *   onClose   () => void
 */
export default function GalleryLightbox({ images, startIdx = 0, onClose }) {
    const [current, setCurrent] = useState(startIdx);

    const prev = useCallback(() => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
    const next = useCallback(() => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [prev, next, onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex justify-between items-center px-6 py-4 flex-shrink-0">
                <span className="text-white/70 text-sm font-medium">{current + 1} / {images.length}</span>
                <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center relative px-16 min-h-0">
                <button
                    onClick={prev}
                    className="absolute left-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition z-10"
                >
                    <ChevronLeft className="w-7 h-7" />
                </button>

                <img
                    key={current}
                    src={images[current]}
                    alt={`Photo ${current + 1}`}
                    className="max-h-full max-w-full object-contain rounded-xl select-none animate-in fade-in duration-200"
                />

                <button
                    onClick={next}
                    className="absolute right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition z-10"
                >
                    <ChevronRight className="w-7 h-7" />
                </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 justify-center py-4 px-6 flex-shrink-0 overflow-x-auto">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === current ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                            }`}
                    >
                        <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
