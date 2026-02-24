import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/Skeleton';
import Button from '../../components/Button';
import { useRouter } from 'expo-router';

export default function SavedScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savedProperties, setSavedProperties] = useState<any[]>([]);

    const loadSaved = async () => {
        try {
            const savedStr = await AsyncStorage.getItem('saved_properties');
            if (savedStr) {
                const savedIds = JSON.parse(savedStr) as string[];
                if (savedIds.length === 0) {
                    setSavedProperties([]);
                    return;
                }

                // Fetch all active properties to filter against saved (or ideally add api.getPropertiesByIds(savedIds))
                // For now api.getProperties() gets all active ones
                const allProps = await api.getProperties();
                const filtered = (allProps || []).filter(p => savedIds.includes(p.id));
                setSavedProperties(filtered);
            } else {
                setSavedProperties([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSaved();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadSaved();
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
            <View className="px-5 pt-4 pb-2 bg-white border-b border-stone-200 shadow-sm z-10">
                <Text className="text-3xl font-black text-stone-900 tracking-tight">Saved</Text>
            </View>

            {loading ? (
                <View className="flex-1 px-4 pt-4">
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                </View>
            ) : savedProperties.length === 0 ? (
                <View className="flex-1 items-center justify-center p-6 bg-stone-50">
                    <View className="w-24 h-24 bg-rose-50 rounded-full items-center justify-center mb-6 border border-rose-100">
                        <Heart size={40} color="#e11d48" />
                    </View>
                    <Text className="text-2xl font-black text-stone-900 mb-2 text-center">No saved properties</Text>
                    <Text className="text-stone-500 text-center mb-8 px-4">
                        As you explore Chaka stays, tap the heart icon to save your favorites here.
                    </Text>
                    <Button title="Start Exploring" onPress={() => router.push('/')} className="w-full max-w-[250px]" />
                </View>
            ) : (
                <FlatList
                    data={savedProperties}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <PropertyCard property={item} />}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                />
            )}
        </SafeAreaView>
    );
}
