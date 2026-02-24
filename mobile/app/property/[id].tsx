import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, MapPin, CheckCircle, Shield } from 'lucide-react-native';
import { api } from '../../services/api';
import Carousel from '../../components/Carousel';
import Button from '../../components/Button';
import ReviewCard from '../../components/ReviewCard';
import ContactHostModal from '../../components/ContactHostModal';
import GalleryLightbox from '../../components/GalleryLightbox';
import { PropertyDetailSkeleton } from '../../components/Skeleton';



export default function PropertyScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [property, setProperty] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [lightboxVisible, setLightboxVisible] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            const [propData, reviewsData] = await Promise.all([
                api.getPropertyById(id),
                api.getPropertyReviews(id)
            ]);
            setProperty(propData);
            setReviews(reviewsData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                {/* Absolute Back Button */}
                <View className="absolute top-12 left-4 z-10 bg-white/80 rounded-full p-2">
                    <ChevronLeft size={24} color="#1c1917" onPress={() => router.back()} />
                </View>
                <PropertyDetailSkeleton />
            </SafeAreaView>
        );
    }

    if (!property) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Property not found</Text>
                <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
            </View>
        );
    }

    const images = property.images?.length > 0 ? property.images : (property.image ? [property.image] : []);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Absolute Back Button */}
            <View className="absolute top-12 left-4 z-10 bg-white/80 rounded-full p-2">
                <ChevronLeft size={24} color="#1c1917" onPress={() => router.back()} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Carousel
                    images={images}
                    height={350}
                    onImagePress={(idx) => {
                        setLightboxIndex(idx);
                        setLightboxVisible(true);
                    }}
                />

                <View className="p-5">
                    <Text className="text-3xl font-black text-stone-900 mb-2 leading-tight">
                        {property.name}
                    </Text>

                    <View className="flex-row items-center mb-6">
                        <View className="bg-emerald-100 px-2 py-1 flex-row items-center rounded-lg mr-3">
                            <Star size={14} color="#059669" fill="#059669" />
                            <Text className="text-emerald-900 font-bold ml-1">{property.rating?.toFixed(1) || 'New'}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MapPin size={16} color="#78716c" />
                            <Text className="text-stone-500 font-medium ml-1">{property.distance} • Chaka</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setContactModalOpen(true)}
                        className="bg-stone-50 rounded-2xl p-4 mb-6 border border-stone-100 flex-row items-center space-x-4"
                    >
                        <View className="w-12 h-12 bg-emerald-900 rounded-full items-center justify-center">
                            <Text className="text-white font-bold text-lg">{property.host_name?.charAt(0) || 'H'}</Text>
                        </View>
                        <View className="flex-1 ml-3">
                            <Text className="text-stone-900 font-bold text-lg">Hosted by {property.host_name || 'Host'}</Text>
                            <Text className="text-stone-500 text-sm">Superhost • 2 years hosting</Text>
                        </View>
                        <Shield size={24} color="#059669" />
                    </TouchableOpacity>

                    <View className="mb-6">
                        <Text className="text-xl font-black text-stone-900 mb-3">About this space</Text>
                        <Text className="text-stone-600 leading-relaxed text-base">
                            {property.description}
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-xl font-black text-stone-900 mb-3">Amenities</Text>
                        {(property.amenities || []).slice(0, 4).map((amenity: string, idx: number) => (
                            <View key={idx} className="flex-row items-center mb-3">
                                <CheckCircle size={20} color="#059669" />
                                <Text className="text-stone-700 ml-3 text-base">{amenity}</Text>
                            </View>
                        ))}
                        <Button title="Show all amenities" variant="outline" className="mt-2" />
                    </View>

                    <View className="mb-6 border-t border-stone-100 pt-6">
                        <View className="flex-row items-center mb-4">
                            <Star size={20} color="#1c1917" fill="#1c1917" />
                            <Text className="text-xl font-black text-stone-900 ml-2">
                                {property.rating?.toFixed(1) || '0.0'} • {property.reviews || 0} reviews
                            </Text>
                        </View>

                        {reviews.length > 0 ? reviews.map((review: any) => (
                            <ReviewCard key={review.id} review={review} />
                        )) : (
                            <Text className="text-stone-500 italic mb-4">No reviews yet for this property.</Text>
                        )}

                        <Button title="Show all reviews" variant="outline" className="mt-2" />
                    </View>
                </View>
            </ScrollView>

            {/* Floating Bottom Booking Bar */}
            <View className="absolute bottom-0 w-full bg-white border-t border-stone-200 px-5 py-4 flex-row justify-between items-center shadow-lg">
                <View>
                    <View className="flex-row items-baseline mb-1">
                        <Text className="text-lg font-black text-stone-900">KES {property.price?.toLocaleString()}</Text>
                        <Text className="text-sm text-stone-500 ml-1">/ night</Text>
                    </View>
                    <Text className="text-emerald-700 font-bold text-xs underline">Available dates</Text>
                </View>
                <Button
                    title="Check out"
                    className="min-w-[140px]"
                    onPress={() => router.push({ pathname: '/booking', params: { propertyId: id, price: property.price, name: property.name } })}
                />
            </View>
            <ContactHostModal
                visible={contactModalOpen}
                host={{ name: property.host_name || 'Host' }}
                propertyName={property.name}
                propertyId={id as string}
                hostId={property.host_id}
                guestName="Guest"
                onClose={() => setContactModalOpen(false)}
                onNavigate={(route) => {
                    setContactModalOpen(false);
                    if (route === 'inbox') router.push('/(tabs)/inbox');
                }}
            />
            <GalleryLightbox
                visible={lightboxVisible}
                images={images}
                startIdx={lightboxIndex}
                onClose={() => setLightboxVisible(false)}
            />
        </SafeAreaView>
    );
}
