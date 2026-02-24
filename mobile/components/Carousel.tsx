import React, { useState, useRef } from 'react';
import { View, FlatList, Dimensions, Image, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

interface CarouselProps {
    images: string[];
    height?: number;
    onImagePress?: (index: number) => void;
}

export default function Carousel({ images, height = 250, onImagePress }: CarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

    if (!images || images.length === 0) return null;

    return (
        <View style={{ height }}>
            <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity activeOpacity={onImagePress ? 0.9 : 1} onPress={() => onImagePress && onImagePress(index)}>
                        <Image
                            source={{ uri: item }}
                            style={{ width, height }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
            />
            {images.length > 1 && (
                <View className="absolute bottom-4 flex-row w-full justify-center gap-2">
                    {images.map((_, i) => (
                        <View
                            key={i}
                            className={`h-2 rounded-full ${i === activeIndex ? 'w-4 bg-white' : 'w-2 bg-white/50'}`}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}
