import React from 'react';

/**
 * PriceRangeSlider
 * Props:
 *   min      number    — absolute minimum (e.g. 0)
 *   max      number    — absolute maximum (e.g. 15000)
 *   value    [lo, hi]
 *   onChange ([lo, hi]) => void
 */
export default function PriceRangeSlider({ min, max, value, onChange }) {
    const [lo, hi] = value;

    const pct = (v) => ((v - min) / (max - min)) * 100;

    const handleLo = (e) => {
        const v = Math.min(Number(e.target.value), hi - 500);
        onChange([v, hi]);
    };
    const handleHi = (e) => {
        const v = Math.max(Number(e.target.value), lo + 500);
        onChange([lo, v]);
    };

    return (
        <div className="mb-8">
            <h4 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wider">Price per Night</h4>

            <div className="flex justify-between text-sm font-bold text-stone-900 mb-3">
                <span>KES {lo.toLocaleString()}</span>
                <span>KES {hi.toLocaleString()}</span>
            </div>

            {/* Track and Inputs stacked together */}
            <div className="relative h-2 bg-stone-200 rounded-full mb-6 flex items-center">
                {/* Active track color */}
                <div
                    className="absolute h-2 bg-emerald-600 rounded-full"
                    style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
                />

                {/* Range inputs overlapping the exact track position */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={500}
                    value={lo}
                    onChange={handleLo}
                    className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={500}
                    value={hi}
                    onChange={handleHi}
                    className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                />
            </div>

            <div className="flex justify-between text-xs text-stone-400 mt-5">
                <span>KES {min.toLocaleString()}</span>
                <span>KES {max.toLocaleString()}</span>
            </div>
        </div>
    );
}
