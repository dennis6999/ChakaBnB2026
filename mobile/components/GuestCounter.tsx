import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface Guests {
    adults: number;
    children: number;
    rooms: number;
}

interface GuestCounterProps {
    guests: Guests;
    onChange: (guests: Guests) => void;
    onClose?: () => void;
}

export default function GuestCounter({ guests, onChange, onClose }: GuestCounterProps) {
    const update = (field: keyof Guests, delta: number) => {
        const limits = { adults: [1, 16], children: [0, 10], rooms: [1, 8] };
        const [min, max] = limits[field];
        onChange({
            ...guests,
            [field]: Math.min(max, Math.max(min, guests[field] + delta)),
        });
    };

    const rows: { field: keyof Guests; label: string; sub: string | null }[] = [
        { field: 'adults', label: 'Adults', sub: 'Ages 13+' },
        { field: 'children', label: 'Children', sub: 'Ages 0–12' },
        { field: 'rooms', label: 'Rooms', sub: null },
    ];

    const totalGuests = guests.adults + guests.children;

    return (
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm self-center">
            {rows.map(({ field, label, sub }) => (
                <View key={field} className="flex-row items-center justify-between py-4 border-b border-stone-100 last:border-0">
                    <View>
                        <Text className="font-bold text-stone-900 text-base">{label}</Text>
                        {!!sub && <Text className="text-xs text-stone-500 mt-1">{sub}</Text>}
                    </View>
                    <View className="flex-row items-center space-x-4">
                        <TouchableOpacity
                            onPress={() => update(field, -1)}
                            disabled={guests[field] <= (field === 'adults' || field === 'rooms' ? 1 : 0)}
                            className={`w-10 h-10 rounded-full border border-stone-300 items-center justify-center pt-0.5
                                ${guests[field] <= (field === 'adults' || field === 'rooms' ? 1 : 0) ? 'opacity-30' : 'bg-white'}`}
                        >
                            <Minus size={16} color="#44403c" />
                        </TouchableOpacity>

                        <Text className="w-8 text-center font-bold text-stone-900 text-lg">{guests[field]}</Text>

                        <TouchableOpacity
                            onPress={() => update(field, 1)}
                            className="w-10 h-10 rounded-full border border-stone-300 items-center justify-center bg-white pt-0.5"
                        >
                            <Plus size={16} color="#44403c" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <View className="mt-6 flex-row justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <Text className="text-sm font-semibold text-stone-600">
                    {totalGuests} guest{totalGuests !== 1 ? 's' : ''}, {guests.rooms} room{guests.rooms !== 1 ? 's' : ''}
                </Text>
                {!!onClose && (
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-emerald-900 px-5 py-2.5 rounded-xl"
                    >
                        <Text className="text-white font-bold text-sm">Done</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
