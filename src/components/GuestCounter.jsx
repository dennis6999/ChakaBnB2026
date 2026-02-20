import React from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * GuestCounter component
 * Props:
 *   guests  { adults, children, rooms }
 *   onChange (guests) => void
 *   onClose  () => void
 */
export default function GuestCounter({ guests, onChange, onClose }) {
    const update = (field, delta) => {
        const limits = { adults: [1, 16], children: [0, 10], rooms: [1, 8] };
        const [min, max] = limits[field];
        onChange({
            ...guests,
            [field]: Math.min(max, Math.max(min, guests[field] + delta)),
        });
    };

    const rows = [
        { field: 'adults', label: 'Adults', sub: 'Ages 13+' },
        { field: 'children', label: 'Children', sub: 'Ages 0–12' },
        { field: 'rooms', label: 'Rooms', sub: null },
    ];

    const totalGuests = guests.adults + guests.children;

    return (
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 w-72">
            {rows.map(({ field, label, sub }) => (
                <div key={field} className="flex items-center justify-between py-4 border-b border-stone-100 last:border-0">
                    <div>
                        <div className="font-bold text-stone-900">{label}</div>
                        {sub && <div className="text-xs text-stone-400">{sub}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => update(field, -1)}
                            className="w-8 h-8 rounded-full border-2 border-stone-300 flex items-center justify-center hover:border-stone-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={guests[field] <= (field === 'adults' || field === 'rooms' ? 1 : 0)}
                        >
                            <Minus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <span className="w-6 text-center font-bold text-stone-900">{guests[field]}</span>
                        <button
                            onClick={() => update(field, 1)}
                            className="w-8 h-8 rounded-full border-2 border-stone-300 flex items-center justify-center hover:border-stone-500 transition"
                        >
                            <Plus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                    </div>
                </div>
            ))}

            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-stone-500">
                    {totalGuests} guest{totalGuests !== 1 ? 's' : ''}, {guests.rooms} room{guests.rooms !== 1 ? 's' : ''}
                </span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="bg-emerald-900 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-emerald-800 transition"
                    >
                        Done
                    </button>
                )}
            </div>
        </div>
    );
}
