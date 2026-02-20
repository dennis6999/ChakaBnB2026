import React from 'react';
import { Check, MapPin, Calendar, Star, ArrowRight } from 'lucide-react';

/**
 * ConfirmationPage — shown after a booking is confirmed.
 * Props: booking { bookingId, name, image, price, date, distance }, onDone (navigates to profile)
 */
export default function ConfirmationPage({ booking, onNavigate }) {
    if (!booking) return null;

    return (
        <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center px-4 py-16">
            <div className="max-w-lg w-full">
                {/* Success banner */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Check className="w-10 h-10 text-emerald-700 stroke-[2.5]" />
                    </div>
                    <h1 className="text-3xl font-black text-stone-900 mb-2">You're all set! 🎉</h1>
                    <p className="text-stone-500 text-lg">Your reservation has been confirmed.</p>
                </div>

                {/* Booking card */}
                <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden mb-6">
                    <img src={booking.image} alt={booking.name} className="w-full h-48 object-cover" />
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-black text-stone-900 mb-1">{booking.name}</h2>
                                <p className="text-sm text-stone-500 flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-emerald-600" /> {booking.distance} • Chaka, Nyeri
                                </p>
                            </div>
                            <div className="flex items-center gap-1 bg-emerald-900 text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" /> {booking.rating?.toFixed(1)}
                            </div>
                        </div>

                        <div className="bg-stone-50 rounded-2xl p-4 space-y-3 border border-stone-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-stone-500 font-medium flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" /> Booking Date
                                </span>
                                <span className="font-bold text-stone-900">{booking.date}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-stone-500 font-medium">Booking ID</span>
                                <span className="font-mono font-bold text-stone-900">{booking.bookingId}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-stone-200 pt-3 mt-1">
                                <span className="font-bold text-stone-500">Total Paid</span>
                                <span className="text-lg font-black text-emerald-900">KES {(booking.price + 450).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-emerald-800 font-medium">
                        A confirmation email has been sent. The host has been notified and will be in touch soon.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex-1 bg-emerald-900 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-800 transition shadow-md flex items-center justify-center gap-2"
                    >
                        View My Trips <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onNavigate('search')}
                        className="flex-1 border-2 border-stone-200 text-stone-700 font-bold py-3.5 rounded-xl hover:bg-stone-100 transition"
                    >
                        Explore More
                    </button>
                </div>
            </div>
        </div>
    );
}
