import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Star, MapPin, Heart, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel from './Carousel';

export default function PropertyCard({ property }: { property: any }) {
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        checkSaved();
    }, [property.id]);

    const checkSaved = async () => {
        try {
            const saved = await AsyncStorage.getItem('saved_properties');
            if (saved) {
                const parsed = JSON.parse(saved);
                setIsSaved(parsed.includes(property.id));
            }
        } catch (e) { }
    };

    const toggleSave = async () => {
        try {
            const saved = await AsyncStorage.getItem('saved_properties');
            let parsed = saved ? JSON.parse(saved) : [];

            if (isSaved) {
                parsed = parsed.filter((id: string) => id !== property.id);
            } else {
                parsed.push(property.id);
            }

            await AsyncStorage.setItem('saved_properties', JSON.stringify(parsed));
            setIsSaved(!isSaved);
        } catch (e) { }
    };

    // Handle single image or multiple images from DB
    const images = property.images?.length > 0 ? property.images : (property.image ? [property.image] : []);

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => router.push(`/property/${property.id}`)}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 10,
            }}
            className="bg-white rounded-[32px] overflow-hidden border border-stone-50 mb-8"
        >
            <View className="relative bg-stone-100">
                <Carousel images={images} height={300} />

                {/* Top Left: Property Type Badge */}
                <View className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                    <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        {property.type || 'Stay'}
                    </Text>
                </View>

                {/* Top Right: Favorite Button */}
                <TouchableOpacity onPress={toggleSave} className="absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow-sm z-10">
                    <Heart size={20} color={isSaved ? '#ef4444' : '#a8a29e'} fill={isSaved ? '#ef4444' : 'transparent'} />
                </TouchableOpacity>
            </View>

            <View className="p-6">
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-3">
                        <Text className="text-2xl font-black text-stone-900 leading-tight tracking-tight" numberOfLines={1}>
                            {property.name}
                        </Text>
                    </View>

                    <View className="flex-row items-center bg-stone-900 px-2.5 py-1.5 rounded-xl">
                        <Star size={12} color="#fbbf24" fill="#fbbf24" />
                        <Text className="text-xs font-black text-white ml-1.5">{property.rating?.toFixed(1) || 'NEW'}</Text>
                    </View>
                </View>

                <View className="flex-row items-center mb-5 opacity-80">
                    <MapPin size={16} color="#059669" />
                    <Text className="text-sm font-bold text-stone-500 ml-1.5">{property.distance || 'View Map'}</Text>
                </View>

                <View className="flex-row justify-between items-end pt-5 border-t border-stone-100/80">
                    <View>
                        <Text className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Price</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-black text-stone-900">KES {property.price?.toLocaleString()} </Text>
                            <Text className="text-sm text-stone-500 font-bold">/ night</Text>
                        </View>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center border border-orange-100">
                        <ChevronRight size={20} color="#ea580c" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
