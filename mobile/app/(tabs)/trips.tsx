import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar } from 'lucide-react-native';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';

export default function TripsScreen() {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const checkUser = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        if (data.session) {
            loadBookings();
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await api.getUserBookings();
            setBookings(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await checkUser();
        setRefreshing(false);
    };

    if (!session) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center p-6">
                <View className="w-24 h-24 bg-stone-200 rounded-full items-center justify-center mb-6">
                    <Calendar size={40} color="#a8a29e" />
                </View>
                <Text className="text-2xl font-black text-stone-900 mb-2">No trips clicked yet</Text>
                <Text className="text-stone-500 text-center mb-8">
                    Time to dust off your bags and start planning your next adventure.
                </Text>
                <Button
                    title="Start Searching"
                    onPress={() => router.push('/')}
                    className="w-full"
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                <Text className="text-3xl font-black text-stone-900 mb-8 tracking-tight">Trips</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#059669" className="mt-10" />
                ) : bookings.length === 0 ? (
                    <View className="bg-white border border-stone-200 rounded-3xl p-6 items-center shadow-sm">
                        <Text className="text-lg font-bold text-stone-900 mb-2 text-center">No trips booked... yet!</Text>
                        <Text className="text-stone-500 text-center mb-6">
                            Time to dust off your bags and start planning your next adventure in Chaka!
                        </Text>
                        <Button title="Start Searching" onPress={() => router.push('/')} />
                    </View>
                ) : (
                    bookings.map((booking) => (
                        <View key={booking.id} className="bg-white border border-stone-200 rounded-3xl p-4 mb-4 shadow-sm">
                            <View className="flex-row justify-between items-start mb-3">
                                <Text className="text-lg font-bold text-stone-900 flex-1 pr-4">
                                    {booking.property_name || 'Property Stay'}
                                </Text>
                                <View className="bg-emerald-100 px-2 py-1 flex-row items-center rounded-lg">
                                    <Text className="text-emerald-900 text-xs font-bold uppercase">{booking.status}</Text>
                                </View>
                            </View>

                            <View className="flex-col gap-2 mb-4">
                                <View className="flex-row items-center">
                                    <Calendar size={14} color="#78716c" />
                                    <Text className="text-stone-600 font-medium ml-2 text-sm">
                                        {new Date(booking.check_in).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <MapPin size={14} color="#78716c" />
                                    <Text className="text-stone-600 font-medium ml-2 text-sm">Chaka, Nyeri (Pay on Arrival)</Text>
                                </View>
                            </View>

                            <View className="border-t border-stone-100 pt-3 mt-1 flex-row justify-between items-center">
                                <Text className="text-stone-500 font-medium text-xs">Total Price</Text>
                                <Text className="text-base font-black text-stone-900">KES {booking.total_price?.toLocaleString()}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
