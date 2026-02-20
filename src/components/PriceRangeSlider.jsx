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

            {/* Track */}
            <div className="relative h-2 bg-stone-200 rounded-full mb-4">
                <div
                    className="absolute h-2 bg-emerald-600 rounded-full"
                    style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
                />
            </div>

            {/* Range inputs stacked */}
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={500}
                    value={lo}
                    onChange={handleLo}
                    className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-700 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={500}
                    value={hi}
                    onChange={handleHi}
                    className="relative w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-700 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                />
            </div>

            <div className="flex justify-between text-xs text-stone-400 mt-5">
                <span>KES {min.toLocaleString()}</span>
                <span>KES {max.toLocaleString()}</span>
            </div>
        </div>
    );
}
