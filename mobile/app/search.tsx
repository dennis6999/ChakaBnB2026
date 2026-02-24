import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Map as MapIcon, List, ChevronLeft, SlidersHorizontal, Check, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import AppMapView from '../components/AppMapView';
import { PropertyCardSkeleton } from '../components/Skeleton';
import Button from '../components/Button';

const CATEGORIES = [
  { id: 'all', label: 'All Stays', icon: '✨' },
  { id: 'Camp', label: 'Cabins', icon: '🪵' },
  { id: 'Resort', label: 'Resorts', icon: '🏖️' },
  { id: 'Apartment', label: 'Apartments', icon: '🏢' },
  { id: 'Hotel', label: 'Hotels', icon: '🏨' },
];

const AMENITIES_LIST = [
  'Wi-Fi', 'Pool', 'Air Conditioning', 'Kitchen', 'Free Parking', 'Pets Allowed', 'Hot Tub', 'BBQ Grill'
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(params.category as string || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState('50000');
  const [beds, setBeds] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Temp Filters State (for Modal)
  const [tempMaxPrice, setTempMaxPrice] = useState('50000');
  const [tempBeds, setTempBeds] = useState(0);
  const [tempAmenities, setTempAmenities] = useState<string[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  // Update active category if params change
  useEffect(() => {
    if (params.category) {
      setActiveCategory(params.category as string);
    }
  }, [params.category]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await api.getProperties();
      setProperties(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openFilters = () => {
    setTempMaxPrice(maxPrice);
    setTempBeds(beds);
    setTempAmenities([...selectedAmenities]);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setMaxPrice(tempMaxPrice);
    setBeds(tempBeds);
    setSelectedAmenities([...tempAmenities]);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setTempMaxPrice('50000');
    setTempBeds(0);
    setTempAmenities([]);
  };

  const toggleAmenity = (amenity: string) => {
    if (tempAmenities.includes(amenity)) {
      setTempAmenities(tempAmenities.filter(a => a !== amenity));
    } else {
      setTempAmenities([...tempAmenities, amenity]);
    }
  };

  const filtered = properties.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.type === activeCategory;
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.distance?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filters logic
    const priceVal = parseInt(maxPrice || '50000', 10);
    const matchesPrice = p.price <= (isNaN(priceVal) ? 50000 : priceVal);
    const propRooms = p.rooms || p.bedrooms || 1;
    const matchesBeds = beds === 0 || propRooms >= beds;
    const matchesAmenities = selectedAmenities.every(a => p.amenities?.includes(a));

    return matchesCategory && matchesSearch && matchesPrice && matchesBeds && matchesAmenities;
  });

  const hasActiveFilters = parseInt(maxPrice) < 50000 || beds > 0 || selectedAmenities.length > 0;

  const renderHeader = () => (
    <View className="mb-4">
      {/* Categories Filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-2 px-2"
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveCategory(item.id)}
            className={`px-4 py-2 rounded-full mr-3 border transition-colors flex-row items-center space-x-2 ${activeCategory === item.id ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-stone-200'
              }`}
          >
            <Text className="text-sm mr-1">{item.icon}</Text>
            <Text className={`text-sm font-bold ${activeCategory === item.id ? 'text-white' : 'text-stone-600'}`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Text className="text-stone-500 font-bold px-4 mt-2 mb-2">
        {loading ? 'Searching...' : `${filtered.length} properties found`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
      {/* Header Search Bar */}
      <View className="px-4 pt-2 pb-4 bg-white border-b border-stone-100 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-stone-100 rounded-full">
          <ChevronLeft size={24} color="#1c1917" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center bg-stone-100 rounded-2xl px-4 py-3 mr-2 border border-stone-200 focus:border-emerald-500 transition-colors">
          <Search size={20} color="#78716c" />
          <TextInput
            className="flex-1 ml-2 text-stone-900 font-bold text-base"
            placeholder="Search Chaka stays..."
            placeholderTextColor="#a8a29e"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          onPress={openFilters}
          className={`p-3 border rounded-2xl items-center justify-center ${hasActiveFilters ? 'bg-emerald-50 border-emerald-500' : 'bg-stone-100 border-stone-200'}`}
        >
          <SlidersHorizontal size={20} color={hasActiveFilters ? "#059669" : "#1c1917"} />
          {hasActiveFilters && (
            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 px-4 pt-4">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </View>
      ) : showMap ? (
        <View className="flex-1 mt-0">
          {renderHeader()}
          <View className="flex-1">
            <AppMapView properties={filtered} />
          </View>
        </View>
      ) : (
        <FlatList
          data={filtered}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <PropertyCard property={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-6xl mb-4">🔍</Text>
              <Text className="text-xl font-bold text-stone-900 mb-2">No properties found</Text>
              <Text className="text-stone-500 text-center px-6">
                We couldn't find any stays matching your search. Try adjusting your filters.
              </Text>
              {hasActiveFilters && (
                <View className="mt-6 w-full px-10">
                  <Button title="Clear Filters" variant="outline" onPress={() => { setMaxPrice('50000'); setBeds(0); setSelectedAmenities([]); }} />
                </View>
              )}
            </View>
          }
        />
      )}

      {/* Floating Map/List Toggle Button */}
      {!loading && filtered.length > 0 && (
        <View className="absolute bottom-6 self-center z-50">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowMap(!showMap)}
            className="bg-stone-900 rounded-full px-5 py-3.5 flex-row items-center shadow-lg"
            style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 }}
          >
            <Text className="text-white font-bold mr-2 text-sm">{showMap ? 'Show list' : 'Map'}</Text>
            {showMap ? <List size={18} color="#fff" /> : <MapIcon size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      )}

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFilters(false)}>
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-stone-200">
            <TouchableOpacity onPress={() => setShowFilters(false)} className="p-2 -ml-2 rounded-full active:bg-stone-100">
              <X size={24} color="#1c1917" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-stone-900">Filters</Text>
            <TouchableOpacity onPress={clearFilters} className="p-2 -mr-2">
              <Text className="text-stone-500 font-bold underline">Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
            {/* Price Range */}
            <View className="mb-8">
              <Text className="text-xl font-black text-stone-900 mb-4">Max Price per night</Text>
              <View className="flex-row items-center bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4">
                <Text className="font-bold text-stone-500 text-lg mr-2">KES</Text>
                <TextInput
                  className="flex-1 text-stone-900 font-bold text-lg"
                  keyboardType="numeric"
                  value={tempMaxPrice}
                  onChangeText={setTempMaxPrice}
                  placeholder="50000"
                />
              </View>
              <Text className="text-sm text-stone-500 mt-2 ml-1">Properties up to KES {tempMaxPrice || '0'}</Text>
            </View>

            {/* Beds */}
            <View className="mb-8 border-t border-stone-100 pt-8">
              <Text className="text-xl font-black text-stone-900 mb-4">Bedrooms</Text>
              <View className="flex-row items-center flex-wrap gap-3">
                {[0, 1, 2, 3, 4].map(num => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setTempBeds(num)}
                    className={`w-14 h-14 rounded-full items-center justify-center border transition-colors ${tempBeds === num ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-stone-200'}`}
                  >
                    <Text className={`font-bold text-lg ${tempBeds === num ? 'text-white' : 'text-stone-600'}`}>
                      {num === 0 ? 'Any' : num === 4 ? '4+' : num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amenities */}
            <View className="mb-8 border-t border-stone-100 pt-8">
              <Text className="text-xl font-black text-stone-900 mb-4">Amenities</Text>
              <View className="flex-row flex-wrap gap-y-3">
                {AMENITIES_LIST.map(amenity => {
                  const isSelected = tempAmenities.includes(amenity);
                  return (
                    <TouchableOpacity
                      key={amenity}
                      onPress={() => toggleAmenity(amenity)}
                      className={`flex-row items-center px-4 py-2 border rounded-full mr-3 ${isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-stone-200'}`}
                    >
                      {isSelected && <Check size={16} color="#059669" className="mr-2" />}
                      <Text className={isSelected ? 'text-emerald-700 font-bold' : 'text-stone-600 font-medium'}>
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View className="p-5 border-t border-stone-200 bg-white">
            <Button title="Show stays" onPress={applyFilters} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
