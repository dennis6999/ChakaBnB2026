import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Star, Map as MapIcon, Home, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
  { name: 'Ranches & Camps', icon: <MapIcon size={28} color="#059669" />, color: 'bg-emerald-100', type: 'Camp' },
  { name: 'Luxury Resorts', icon: <Star size={28} color="#ea580c" />, color: 'bg-orange-100', type: 'Resort' },
  { name: 'Town Apartments', icon: <Home size={28} color="#2563eb" />, color: 'bg-blue-100', type: 'Apartment' },
  { name: 'Wellness Retreats', icon: <Heart size={28} color="#e11d48" />, color: 'bg-rose-100', type: 'Hotel' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      setLoading(true);
      const data = await api.getProperties();
      setFeatured((data || []).slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1547471080-7cb2cb6a5a36?auto=format&fit=crop&w=1920&q=80' }}
          className="relative px-5 pt-12 pb-24 rounded-b-[40px] overflow-hidden"
          imageStyle={{ borderRadius: 40, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          <LinearGradient
            colors={['rgba(6, 78, 59, 0.95)', 'rgba(6, 78, 59, 0.8)', 'transparent']}
            className="absolute inset-0"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View className="relative z-10 flex-col items-start pt-8">
            <View className="bg-orange-600/20 border border-orange-500/30 px-4 py-1.5 rounded-full mb-6 flex-row items-center">
              <Star size={14} color="#fdba74" fill="#fdba74" />
              <Text className="text-orange-300 font-bold uppercase tracking-wider text-xs ml-2">Premium Stays in Nyeri</Text>
            </View>

            <Text className="text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
              Escape to the{'\n'}
              <Text className="text-orange-400">Heart of Kenya.</Text>
            </Text>

            <Text className="text-stone-200 text-base font-medium leading-relaxed max-w-[80%]">
              Discover serene ranches, luxurious resorts, and cozy retreats tucked away in the beautiful landscapes of Chaka town.
            </Text>
          </View>
        </ImageBackground>

        {/* Floating Search Bar */}
        <View className="px-5 -mt-8 mb-10 z-20">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/search')}
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 }}
            className="flex-row items-center bg-white rounded-full px-5 py-4 border border-stone-100"
          >
            <Search size={22} color="#10b981" />
            <Text className="ml-3 text-stone-400 font-bold text-base flex-1">Where to next?</Text>
            <View className="bg-emerald-600 rounded-full px-4 py-2">
              <Text className="text-white font-bold text-sm">Search</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View className="px-5 mb-10">
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text className="text-2xl font-black text-stone-900 tracking-tight mb-1">Explore by Category</Text>
              <Text className="text-stone-500 font-medium">Find exactly what you're looking for</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: '/search', params: { category: cat.type } })}
                className="w-[48%] bg-white rounded-3xl p-5 border border-stone-100 mb-4 items-center shadow-sm"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 }}
              >
                <View className={`${cat.color} p-4 rounded-2xl mb-3`}>
                  {cat.icon}
                </View>
                <Text className="font-bold text-stone-900 text-center">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Properties */}
        <View className="px-5">
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text className="text-2xl font-black text-stone-900 tracking-tight mb-1">Featured Stays in Chaka</Text>
              <Text className="text-stone-500 font-medium">Highly rated by recent guests</Text>
            </View>
          </View>

          {loading ? (
            <View>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </View>
          ) : (
            featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
