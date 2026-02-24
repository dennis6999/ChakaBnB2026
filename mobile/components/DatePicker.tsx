import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDay(a: Date | null, b: Date | null) {
    return a && b && a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(date: Date, start: Date | null, end: Date | null) {
    if (!start || !end) return false;
    return date > start && date < end;
}

interface DatePickerProps {
    checkIn: Date | null;
    checkOut: Date | null;
    onChange: (checkIn: Date | null, checkOut: Date | null) => void;
    onClose?: () => void;
}

export default function DatePicker({ checkIn, checkOut, onChange, onClose }: DatePickerProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selecting, setSelecting] = useState<'checkin' | 'checkout'>(checkIn && !checkOut ? 'checkout' : 'checkin');

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handleDayClick = (date: Date) => {
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
            }
        }
    };

    const renderMonth = (year: number, month: number) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells: (Date | null)[] = [];

        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            date.setHours(0, 0, 0, 0);
            cells.push(date);
        }

        // Fill remaining spaces in the grid to maintain height
        while (cells.length % 7 !== 0) cells.push(null);

        return (
            <View className="w-full">
                <Text className="text-center font-bold text-lg text-stone-900 mb-4">
                    {MONTHS[month]} {year}
                </Text>

                <View className="flex-row mb-2">
                    {DAYS.map(d => (
                        <Text key={d} className="flex-1 text-center text-xs font-bold text-stone-400 py-1">{d}</Text>
                    ))}
                </View>

                <View className="flex-row flex-wrap">
                    {cells.map((date, i) => {
                        const cellWidth = (Dimensions.get('window').width - 48 - 32) / 7; // Screen width - padding

                        // Empty cell
                        if (!date) {
                            return <View key={`empty-${i}`} style={{ width: cellWidth, height: cellWidth }} />;
                        }

                        const isPast = date < today;
                        const isCheckIn = isSameDay(date, checkIn);
                        const isCheckOut = isSameDay(date, checkOut);
                        const isInRange = isBetween(date, checkIn, checkOut);

                        let containerCls = `items-center justify-center p-0.5 `;
                        let innerCls = `w-10 h-10 items-center justify-center rounded-full `;
                        let textCls = `text-sm font-medium `;

                        if (isPast) {
                            textCls += 'text-stone-300';
                        } else if (isCheckIn) {
                            innerCls += 'bg-emerald-900';
                            textCls += 'text-white font-bold';
                            if (checkOut) containerCls += 'bg-emerald-100 rounded-l-full';
                        } else if (isCheckOut) {
                            innerCls += 'bg-emerald-900';
                            textCls += 'text-white font-bold';
                            containerCls += 'bg-emerald-100 rounded-r-full';
                        } else if (isInRange) {
                            innerCls += 'bg-emerald-100';
                            containerCls += 'bg-emerald-100';
                            textCls += 'text-emerald-900 font-semibold';
                        } else {
                            innerCls += 'bg-white';
                            textCls += 'text-stone-700';
                        }

                        return (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={isPast ? 1 : 0.7}
                                onPress={() => !isPast && handleDayClick(date)}
                                style={{ width: `${100 / 7}%` }}
                                className={containerCls}
                            >
                                <View className={innerCls}>
                                    <Text className={textCls}>{date.getDate()}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const nights = checkIn && checkOut
        ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <View className="bg-white rounded-3xl p-6 w-full">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={prevMonth} className="p-3 bg-stone-50 rounded-full">
                    <ChevronLeft size={20} color="#44403c" />
                </TouchableOpacity>
                <Text className="text-sm font-semibold text-stone-600">
                    {selecting === 'checkin' ? 'Select check-in date' : 'Select check-out date'}
                </Text>
                <TouchableOpacity onPress={nextMonth} className="p-3 bg-stone-50 rounded-full">
                    <ChevronRight size={20} color="#44403c" />
                </TouchableOpacity>
            </View>

            {/* Calendar */}
            {renderMonth(viewYear, viewMonth)}

            {/* Footer */}
            <View className="mt-6 pt-5 border-t border-stone-100 flex-row justify-between items-center">
                <View>
                    {checkIn && checkOut ? (
                        <Text className="font-bold text-stone-900">{nights} night{nights !== 1 ? 's' : ''} selected</Text>
                    ) : (
                        <Text className="text-sm text-stone-500">Choose your dates</Text>
                    )}
                </View>
                <View className="flex-row items-center space-x-4">
                    <TouchableOpacity onPress={() => { onChange(null, null); setSelecting('checkin'); }}>
                        <Text className="text-sm font-bold text-stone-500 underline">Clear</Text>
                    </TouchableOpacity>
                    {!!onClose && (
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-emerald-900 px-5 py-2.5 rounded-xl ml-4"
                        >
                            <Text className="text-white font-bold text-sm">Done</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}
