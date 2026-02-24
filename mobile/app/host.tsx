import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Settings, Calendar, TrendingUp, Home, DollarSign, Activity, CheckCircle, Clock } from 'lucide-react-native';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

export default function HostDashboard() {
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('insights'); // insights, listings, reservations
    const [session, setSession] = useState<any>(null);

    const loadData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                return;
            }
            setSession(session);

            const userId = session.user.id;
            const [propsData, resData] = await Promise.all([
                api.getHostProperties(userId),
                api.getHostReservations(userId)
            ]);

            setProperties(propsData || []);
            setReservations(resData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Analytics Math
    const totalRevenue = reservations
        .filter(r => r.status === 'Completed' || r.status === 'Confirmed')
        .reduce((sum, r) => sum + Number(r.total_price || 0), 0);

    const upcomingBookings = reservations.filter(r => new Date(r.check_in) >= new Date() && String(r.status) !== 'HostBlock').length;

    const renderInsights = () => (
        <View className="p-5">
            <Text className="text-2xl font-black text-stone-900 mb-6">Overview</Text>

            <View className="flex-row flex-wrap justify-between">
                <View className="w-[48%] bg-white border border-stone-200 rounded-3xl p-5 mb-4 shadow-sm">
                    <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mb-3">
                        <DollarSign size={20} color="#059669" />
                    </View>
                    <Text className="text-stone-500 font-bold mb-1">Total Earnings</Text>
                    <Text className="text-xl font-black text-stone-900">KES {totalRevenue.toLocaleString()}</Text>
                </View>

                <View className="w-[48%] bg-white border border-stone-200 rounded-3xl p-5 mb-4 shadow-sm">
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3">
                        <Calendar size={20} color="#2563eb" />
                    </View>
                    <Text className="text-stone-500 font-bold mb-1">Upcoming</Text>
                    <Text className="text-xl font-black text-stone-900">{upcomingBookings} Reservations</Text>
                </View>

                <View className="w-[48%] bg-white border border-stone-200 rounded-3xl p-5 mb-4 shadow-sm">
                    <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-3">
                        <Home size={20} color="#ea580c" />
                    </View>
                    <Text className="text-stone-500 font-bold mb-1">Active Listings</Text>
                    <Text className="text-xl font-black text-stone-900">{properties.filter(p => p.is_active).length}</Text>
                </View>

                <View className="w-[48%] bg-white border border-stone-200 rounded-3xl p-5 mb-4 shadow-sm">
                    <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-3">
                        <Activity size={20} color="#9333ea" />
                    </View>
                    <Text className="text-stone-500 font-bold mb-1">Occupancy</Text>
                    <Text className="text-xl font-black text-stone-900">
                        {properties.length > 0 ? '64%' : '0%'}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderListings = () => (
        <View className="p-5">
            <View className="flex-row justify-between items-end mb-6">
                <Text className="text-2xl font-black text-stone-900">Your Properties</Text>
                <TouchableOpacity className="flex-row items-center bg-emerald-100 px-3 py-1.5 rounded-full">
                    <Plus size={16} color="#059669" />
                    <Text className="text-emerald-800 font-bold text-xs ml-1">Add New</Text>
                </TouchableOpacity>
            </View>

            {properties.length === 0 ? (
                <View className="bg-white border border-stone-200 rounded-3xl p-6 items-center shadow-sm">
                    <Text className="text-lg font-bold text-stone-900 mb-2">No listings yet</Text>
                    <Text className="text-stone-500 text-center">Start earning by creating your first property listing on ChakaBnB.</Text>
                </View>
            ) : (
                properties.map(prop => (
                    <View key={prop.id} className="bg-white border border-stone-200 rounded-3xl p-4 mb-4 shadow-sm flex-row items-center">
                        <Image
                            source={{ uri: prop.image || 'https://via.placeholder.com/150' }}
                            className="w-16 h-16 bg-stone-200 rounded-xl mr-4"
                        />
                        <View className="flex-1">
                            <Text className="font-bold text-stone-900 text-lg mb-1 leading-tight" numberOfLines={1}>{prop.name}</Text>
                            <Text className="text-stone-500 text-sm font-medium">{prop.type} • KES {prop.price?.toLocaleString()} / night</Text>
                        </View>
                        <TouchableOpacity className="p-2">
                            <Settings size={20} color="#a8a29e" />
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </View>
    );

    const renderReservations = () => {
        // Filter out blocks
        const actualReservations = reservations.filter(r => String(r.status) !== 'HostBlock');

        return (
            <View className="p-5">
                <Text className="text-2xl font-black text-stone-900 mb-6">Reservations</Text>

                {actualReservations.length === 0 ? (
                    <View className="bg-white border border-stone-200 rounded-3xl p-6 items-center shadow-sm">
                        <Calendar size={32} color="#d6d3d1" className="mb-4" />
                        <Text className="text-lg font-bold text-stone-900 mb-2">No reservations yet</Text>
                        <Text className="text-stone-500 text-center">When guests book your properties, they will appear here.</Text>
                    </View>
                ) : (
                    actualReservations.map(res => {
                        const isUpcoming = new Date(res.check_in) > new Date();
                        const statusColor = res.status === 'Confirmed' ? 'text-emerald-600 bg-emerald-100' :
                            res.status === 'Pending' ? 'text-orange-600 bg-orange-100' :
                                res.status === 'Cancelled' ? 'text-rose-600 bg-rose-100' :
                                    'text-stone-600 bg-stone-100';

                        return (
                            <View key={res.id} className="bg-white border border-stone-200 rounded-3xl p-5 mb-4 shadow-sm">
                                <View className="flex-row justify-between items-start mb-3 border-b border-stone-100 pb-3">
                                    <View className="flex-1">
                                        <Text className="font-black text-stone-900 text-lg" numberOfLines={1}>
                                            {res.properties?.name || 'Property'}
                                        </Text>
                                        <Text className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">
                                            {new Date(res.check_in).toLocaleDateString()} - {new Date(res.check_out).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className={`px-2 py-1 rounded-md ${statusColor.split(' ')[1]}`}>
                                        <Text className={`text-xs font-bold ${statusColor.split(' ')[0]}`}>{res.status}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center mt-1">
                                    <View className="flex-row items-center">
                                        <View className="w-8 h-8 bg-stone-100 rounded-full items-center justify-center mr-2 border border-stone-200">
                                            <Text className="font-bold text-stone-600 text-xs">G</Text>
                                        </View>
                                        <Text className="font-bold text-stone-700">Guest</Text>
                                    </View>
                                    <Text className="font-black text-stone-900 text-lg">KES {res.total_price?.toLocaleString()}</Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        );
    };

    if (!session && !loading) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50 justify-center items-center p-6">
                <Text className="text-2xl font-black text-stone-900 mb-2">Host Access</Text>
                <Text className="text-stone-500 text-center mb-6">Please log in to manage your properties.</Text>
                <TouchableOpacity onPress={() => router.push('/auth')} className="bg-emerald-600 px-8 py-4 rounded-xl">
                    <Text className="text-white font-bold">Log in</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
            <View className="px-4 pt-3 pb-3 flex-row items-center justify-between border-b border-stone-200 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-stone-100">
                    <ChevronLeft size={28} color="#1c1917" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-stone-900">Host Dashboard</Text>
                <View className="w-10" />
            </View>

            {/* Tab Navigation */}
            <View className="flex-row bg-white border-b border-stone-200 px-2 pt-2">
                {[
                    { id: 'insights', label: 'Insights', icon: TrendingUp },
                    { id: 'reservations', label: 'Reservations', icon: Calendar },
                    { id: 'listings', label: 'Listings', icon: Home }
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 items-center border-b-2 ${isActive ? 'border-emerald-600' : 'border-transparent'}`}
                        >
                            <View className="flex-row items-center">
                                <Icon size={16} color={isActive ? '#059669' : '#78716c'} />
                                <Text className={`ml-2 text-sm font-bold ${isActive ? 'text-emerald-700' : 'text-stone-500'}`}>
                                    {tab.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#059669" className="mt-10" />
                ) : (
                    <>
                        {activeTab === 'insights' && renderInsights()}
                        {activeTab === 'listings' && renderListings()}
                        {activeTab === 'reservations' && renderReservations()}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
