import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(date, start, end) {
    if (!start || !end) return false;
    return date > start && date < end;
}

/**
 * DatePicker component
 * Props:
 *   checkIn  {Date|null}   – selected check-in date
 *   checkOut {Date|null}   – selected check-out date
 *   onChange (checkIn, checkOut) => void
 *   onClose  () => void
 */
export default function DatePicker({ checkIn, checkOut, onChange, onClose }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    // 'checkin' | 'checkout'
    const [selecting, setSelecting] = useState(checkIn ? 'checkout' : 'checkin');
    const [hovered, setHovered] = useState(null);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handleDayClick = (date) => {
        if (date < today) return;
        if (selecting === 'checkin') {
            onChange(date, null);
            setSelecting('checkout');
        } else {
            if (checkIn && date <= checkIn) {
                onChange(date, null);
                setSelecting('checkout');
            } else {
                onChange(checkIn, date);
                setSelecting('checkin');
                onClose && onClose();
            }
        }
    };

    const renderMonth = (year, month) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells = [];

        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            date.setHours(0, 0, 0, 0);
            cells.push(date);
        }

        return (
            <div className="flex-1 min-w-[280px]">
                <div className="text-center font-bold text-stone-900 mb-4">
                    {MONTHS[month]} {year}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-xs font-bold text-stone-400 py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {cells.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} />;
                        const isPast = date < today;
                        const isCheckIn = isSameDay(date, checkIn);
                        const isCheckOut = isSameDay(date, checkOut);
                        const isInRange = isBetween(date, checkIn, checkOut) ||
                            (selecting === 'checkout' && hovered && checkIn && isBetween(date, checkIn, hovered));
                        const isHovered = isSameDay(date, hovered);

                        let cls = 'relative w-full aspect-square flex items-center justify-center text-sm rounded-full transition-all cursor-pointer font-medium ';
                        if (isPast) {
                            cls += 'text-stone-300 cursor-not-allowed ';
                        } else if (isCheckIn || isCheckOut) {
                            cls += 'bg-emerald-900 text-white font-bold z-10 ';
                        } else if (isInRange) {
                            cls += 'bg-emerald-100 text-emerald-900 rounded-none ';
                        } else if (isHovered && !isPast) {
                            cls += 'bg-stone-100 ';
                        } else {
                            cls += 'hover:bg-stone-100 text-stone-700 ';
                        }

                        return (
                            <div
                                key={i}
                                className={cls}
                                onClick={() => !isPast && handleDayClick(date)}
                                onMouseEnter={() => setHovered(date)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {date.getDate()}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // second month
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;

    const nights = checkIn && checkOut
        ? Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 w-full max-w-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-full transition">
                    <ChevronLeft className="w-5 h-5 text-stone-600" />
                </button>
                <div className="text-sm font-semibold text-stone-500">
                    {selecting === 'checkin' ? 'Select check-in date' : 'Select check-out date'}
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-full transition">
                    <ChevronRight className="w-5 h-5 text-stone-600" />
                </button>
            </div>

            {/* Two-month view */}
            <div className="flex flex-col sm:flex-row gap-8">
                {renderMonth(viewYear, viewMonth)}
                <div className="hidden sm:block w-px bg-stone-100" />
                {renderMonth(nextY, nextM)}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-sm text-stone-500">
                    {checkIn && checkOut
                        ? <span className="font-semibold text-stone-900">{nights} night{nights !== 1 ? 's' : ''} selected</span>
                        : <span>Choose your dates</span>
                    }
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { onChange(null, null); setSelecting('checkin'); }}
                        className="text-sm text-stone-500 hover:text-stone-700 font-medium transition"
                    >
                        Clear
                    </button>
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
        </div>
    );
}
