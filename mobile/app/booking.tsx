import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react-native';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import Button from '../components/Button';
import DatePicker from '../components/DatePicker';
import GuestCounter from '../components/GuestCounter';

export default function BookingScreen() {
    const router = useRouter();
    const { propertyId, price, name } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guests, setGuests] = useState({ adults: 1, children: 0, rooms: 1 });

    const nights = checkIn && checkOut
        ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

    const basePrice = Number(price) * nights;
    const serviceFee = 450;
    const totalPrice = basePrice + serviceFee;

    const handleBook = async () => {
        if (!checkIn || !checkOut) {
            setError('Please select check-in and check-out dates.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace({ pathname: '/auth', params: { returnTo: `/booking?propertyId=${propertyId}&price=${price}&name=${name}` } });
                return;
            }

            const booking = await api.createBooking({
                id: propertyId,
                name: name,
                price: Number(price),
                totalPrice: totalPrice,
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                guests: guests.adults + guests.children
            });

            router.replace({
                pathname: '/confirmation',
                params: { bookingId: booking.bookingId, name: booking.name, price: booking.totalPrice }
            });
        } catch (err: any) {
            setError(err.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
            <View className="px-4 py-3 flex-row items-center border-b border-stone-200 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <X size={24} color="#1c1917" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-stone-900 ml-4 flex-1 text-center pr-10">
                    Confirm and Pay
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {error ? <Text className="text-red-600 font-bold mb-4">{error}</Text> : null}

                <View className="bg-white rounded-3xl p-5 border border-stone-200 mb-6 shadow-sm">
                    <Text className="text-xl font-bold text-stone-900 mb-2">{name}</Text>
                    <View className="flex-row items-center mb-4">
                        <MapPin size={16} color="#059669" />
                        <Text className="text-stone-500 ml-1">Chaka, Nyeri (Payment on Arrival)</Text>
                    </View>

                    <View className="border-t border-stone-100 py-3 mt-2 flex-row justify-between items-center">
                        <Text className="text-stone-500 font-medium">{nights} Night{nights !== 1 ? 's' : ''}</Text>
                        <Text className="text-stone-900 font-bold">KES {basePrice.toLocaleString()}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-stone-500 font-medium underline">Service Fee</Text>
                        <Text className="text-stone-900 font-bold">KES {serviceFee.toLocaleString()}</Text>
                    </View>

                    <View className="border-t border-stone-200 pt-4 mt-2 flex-row justify-between items-center">
                        <Text className="text-lg font-black text-stone-900">Total</Text>
                        <Text className="text-xl font-black text-emerald-900">KES {totalPrice.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Date Selection */}
                <Text className="text-lg font-black text-stone-900 mb-3 ml-1">Select Dates</Text>
                <DatePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChange={(inDate, outDate) => {
                        setCheckIn(inDate);
                        setCheckOut(outDate);
                    }}
                />

                {/* Guests Selection */}
                <Text className="text-lg font-black text-stone-900 mt-6 mb-3 ml-1">Guests</Text>
                <GuestCounter
                    guests={guests}
                    onChange={setGuests}
                />

                <View className="mt-8">
                    <Button title="Confirm Booking" onPress={handleBook} loading={loading} />
                    <Text className="text-center text-xs text-stone-500 mt-4">
                        You won't be charged yet. Payment is collected securely upon arrival at the property via M-Pesa or Cash.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
