import React from 'react';
import { View, Text, Image } from 'react-native';
import { Star } from 'lucide-react-native';

export default function ReviewCard({ review }: { review: any }) {
    return (
        <View className="bg-white border text-sm border-stone-100 rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center mb-4">
                <Image
                    source={{ uri: review.user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${review.user.name}` }}
                    className="w-12 h-12 rounded-full bg-stone-100"
                />
                <View className="ml-3">
                    <Text className="font-bold text-stone-900 text-base">{review.user.name}</Text>
                    <Text className="text-xs text-stone-500">{review.date}</Text>
                </View>
            </View>

            <View className="flex-row items-center mb-3">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        color={i < review.rating ? "#ea580c" : "#e5e7eb"}
                        fill={i < review.rating ? "#ea580c" : "transparent"}
                        className="mr-0.5"
                    />
                ))}
            </View>

            <Text className="text-stone-600 leading-relaxed text-sm">
                "{review.comment}"
            </Text>
        </View>
    );
}
