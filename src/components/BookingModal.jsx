import React, { useState } from 'react';
import { X, MapPin, Loader } from 'lucide-react';

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible Dates';

export default function BookingModal({ property, onConfirm, onClose }) {
    const [loading, setLoading] = useState(false);

    if (!property) return null;

    const checkInStr = formatDate(property.checkIn);
    const checkOutStr = property.checkOut ? ` - ${formatDate(property.checkOut)}` : '';

    // Calculate nights if dates are provided
    const nights = property.checkIn && property.checkOut
        ? Math.round((property.checkOut - property.checkIn) / (1000 * 60 * 60 * 24))
        : 1;

    const dateRange = property.checkIn
        ? `${checkInStr}${checkOutStr} (${nights} Night${nights > 1 ? 's' : ''})`
        : '1 Night (Flexible)';

    // Fallback logic in case property.totalPrice wasn't passed 
    const isDynamicBooking = !!property.totalPrice;
    const rooms = property.rooms || 1;
    const totalPrice = (property.totalPrice || property.price) + (isDynamicBooking ? 0 : 450);
    const taxes = isDynamicBooking ? (property.rooms || 1) * 450 : 450;

    const handleConfirm = () => {
        setLoading(true);
        setTimeout(() => {
            onConfirm();
            // We do not setLoading(false) here because usually modifying parent state closes the modal.
            // If it doesn't, it unmounts anyway.
        }, 1200);
    };

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all border border-stone-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-modal-title"
            >
                {/* Header */}
                <div className="bg-emerald-900 text-white px-6 py-5 flex justify-between items-center">
                    <h2 id="booking-modal-title" className="text-xl font-bold tracking-tight">Confirm Reservation</h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-1.5 rounded-full transition"
                        aria-label="Close dialog"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    <h3 className="text-2xl font-black text-stone-900 mb-2 leading-tight">{property.name}</h3>
                    <p className="text-sm text-stone-500 mb-8 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-600" /> {property.distance}
                    </p>

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-8">
                        <div className="flex justify-between mb-4 pb-4 border-b border-stone-200">
                            <span className="font-semibold text-stone-500">Dates</span>
                            <span className="text-stone-900 font-bold max-w-[60%] text-right">{dateRange}</span>
                        </div>
                        <div className="flex justify-between mb-4 pb-4 border-b border-stone-200">
                            <span className="font-semibold text-stone-500">Rooms</span>
                            <span className="text-stone-900 font-bold">{rooms} Room{rooms > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-stone-500">Total Price</span>
                            <span className="text-2xl font-black text-emerald-900">
                                KES {totalPrice.toLocaleString()}
                            </span>
                        </div>
                        <div className="text-right text-xs text-stone-400 mt-1 font-medium">
                            Includes KES {taxes.toLocaleString()} in taxes
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-3 border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20 transition w-full sm:w-auto flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <><Loader className="w-4 h-4 animate-spin" /> Processing…</>
                            ) : (
                                'Confirm & Pay'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
