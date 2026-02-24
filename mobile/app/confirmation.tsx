import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import Button from '../components/Button';

export default function ConfirmationScreen() {
    const router = useRouter();
    const { bookingId, name, price } = useLocalSearchParams();

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
                <CheckCircle size={40} color="#059669" />
            </View>

            <Text className="text-3xl font-black text-stone-900 text-center mb-2 tracking-tight">
                You're all set! 🎉
            </Text>
            <Text className="text-stone-500 text-center mb-8 text-base">
                Your reservation for {name} has been confirmed.
            </Text>

            <View className="bg-stone-50 border border-stone-200 rounded-2xl w-full p-4 mb-8">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-stone-500 font-medium">Booking ID</Text>
                    <Text className="text-stone-900 font-bold font-mono">{bookingId}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-stone-500 font-medium">Total Paid</Text>
                    <Text className="text-stone-900 font-black">KES {Number(price).toLocaleString()}</Text>
                </View>
            </View>

            <View className="w-full gap-3">
                <Button
                    title="View My Trips"
                    onPress={() => router.replace('/(tabs)/trips')}
                />
                <Button
                    title="Explore More"
                    variant="outline"
                    onPress={() => router.replace('/')}
                />
            </View>
        </SafeAreaView>
    );
}
