import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface AppMapViewProps {
    properties: any[];
    locationName?: string;
}

export default function AppMapView({ properties, locationName = 'Chaka, Nyeri County' }: AppMapViewProps) {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const [focusedPropertyId, setFocusedPropertyId] = useState<string | null>(null);

    // Chaka Town base
    const defaultCenter = {
        latitude: -0.3551,
        longitude: 36.9989,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    useEffect(() => {
        if (!properties || properties.length === 0 || !mapRef.current) return;

        const validCoords = properties
            .filter(p => p.latitude && p.longitude)
            .map(p => ({
                latitude: Number(p.latitude),
                longitude: Number(p.longitude),
            }));

        if (validCoords.length > 0) {
            // Fit map to markers after a slight delay
            setTimeout(() => {
                mapRef.current?.fitToCoordinates(validCoords, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }, 500);
        }
    }, [properties]);

    return (
        <View className="flex-1 bg-white rounded-t-3xl border border-stone-200 shadow-sm overflow-hidden">
            <View style={{ height: Dimensions.get('window').height * 0.5 }}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={defaultCenter}
                    showsUserLocation
                >
                    {properties.filter(p => p.latitude && p.longitude).map(property => {
                        const isFocused = focusedPropertyId === property.id;

                        return (
                            <Marker
                                key={property.id}
                                coordinate={{
                                    latitude: Number(property.latitude),
                                    longitude: Number(property.longitude),
                                }}
                                onPress={() => setFocusedPropertyId(property.id)}
                            >
                                <View className={`items-center justify-center transform ${isFocused ? 'scale-110 z-50' : ''}`}>
                                    <View className={`px-3 py-1.5 rounded-full shadow-lg border-2 ${isFocused ? 'bg-orange-600 border-orange-600' : 'bg-white border-stone-200'
                                        }`}>
                                        <Text className={`font-bold text-sm ${isFocused ? 'text-white' : 'text-stone-900'
                                            }`}>
                                            KES {property.price.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View className={`w-3 h-3 rotate-45 border-r-2 border-b-2 -mt-[6px] ${isFocused ? 'bg-orange-600 border-orange-600' : 'bg-white border-stone-200'
                                        }`} />
                                </View>

                                <Callout tooltip onPress={() => router.push(`/property/${property.id}`)}>
                                    <View className="bg-white rounded-2xl overflow-hidden w-60 shadow-xl border border-stone-200">
                                        {(property.images?.length > 0 || property.image) && (
                                            <Image
                                                source={{ uri: property.images?.[0] || property.image }}
                                                className="w-full h-32"
                                                resizeMode="cover"
                                            />
                                        )}
                                        <View className="p-4">
                                            <Text className="font-bold text-stone-900" numberOfLines={1}>
                                                {property.name}
                                            </Text>
                                            <Text className="text-sm text-stone-500 mb-2">
                                                {property.bedrooms} beds • {property.guests} guests
                                            </Text>
                                            <View className="flex-row items-center justify-between">
                                                <Text className="font-black text-emerald-700">
                                                    KES {property.price.toLocaleString()}
                                                </Text>
                                                <ChevronRight size={16} color="#059669" />
                                            </View>
                                        </View>
                                    </View>
                                </Callout>
                            </Marker>
                        );
                    })}
                </MapView>
            </View>

            <View className="flex-1 p-4 bg-white border-t border-stone-200">
                <Text className="text-xs text-stone-500 text-center mb-3 font-medium">
                    Showing properties in <Text className="font-bold text-stone-700">{locationName}</Text>
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row flex-wrap justify-between">
                        {properties.map((p) => {
                            const isFocused = focusedPropertyId === p.id;
                            return (
                                <TouchableOpacity
                                    key={p.id}
                                    activeOpacity={0.7}
                                    onPress={() => router.push(`/property/${p.id}`)}
                                    className={`w-[48%] p-3 rounded-2xl border mb-3 ${isFocused
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-stone-200 bg-white'
                                        }`}
                                >
                                    <Text className="font-bold text-xs text-stone-900 mb-1" numberOfLines={1}>{p.name}</Text>
                                    <Text className={`text-xs font-bold ${isFocused ? 'text-orange-700' : 'text-emerald-700'
                                        }`}>
                                        KES {p.price.toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
