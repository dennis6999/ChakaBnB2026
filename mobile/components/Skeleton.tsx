import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

/** Generic shimmer skeleton block with Reanimated pulse effect */
export const Shimmer = ({ className = '' }) => {
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={animatedStyle} className={`bg-stone-200 rounded-xl ${className}`} />
    );
};

/** Skeleton for a grid property card */
export function PropertyCardSkeleton() {
    return (
        <View className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm mb-6">
            <Shimmer className="h-64 w-full rounded-none" />
            <View className="p-5 space-y-3">
                <View className="flex-row justify-between items-start mb-2">
                    <Shimmer className="h-6 w-3/4 rounded-md" />
                    <Shimmer className="h-6 w-12 rounded-lg" />
                </View>
                <Shimmer className="h-4 w-1/2 rounded-md mb-2" />

                <Shimmer className="h-4 w-full rounded-md" />
                <Shimmer className="h-4 w-5/6 rounded-md mb-2" />

                <View className="pt-4 border-t border-stone-100 flex-row justify-between mt-2">
                    <Shimmer className="h-6 w-32 rounded-md" />
                    <Shimmer className="h-6 w-16 rounded-md" />
                </View>
            </View>
        </View>
    );
}

/** Skeleton for property detail page */
export function PropertyDetailSkeleton() {
    return (
        <View className="flex-1 px-4 pt-4 bg-stone-50">
            <Shimmer className="h-6 w-40 mb-4 rounded-md" />
            <Shimmer className="h-10 w-3/4 mb-4 rounded-md" />
            <Shimmer className="h-[40vh] w-full rounded-3xl mb-8" />

            <View className="space-y-4 mb-8">
                <Shimmer className="h-6 w-1/2 rounded-md mb-4" />
                <Shimmer className="h-4 w-full rounded-md mt-2" />
                <Shimmer className="h-4 w-5/6 rounded-md mt-2" />
                <Shimmer className="h-4 w-4/6 rounded-md mt-2" />
            </View>

            <Shimmer className="h-24 w-full rounded-2xl mb-6" />
        </View>
    );
}
