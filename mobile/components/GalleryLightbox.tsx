import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface GalleryLightboxProps {
    visible: boolean;
    images: string[];
    startIdx?: number;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function GalleryLightbox({ visible, images, startIdx = 0, onClose }: GalleryLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(startIdx);
    const mainListRef = useRef<FlatList>(null);
    const thumbListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(startIdx);
            // Slight delay to allow lists to render before scrolling
            setTimeout(() => {
                mainListRef.current?.scrollToIndex({ index: startIdx, animated: false });
                thumbListRef.current?.scrollToIndex({ index: startIdx, animated: false, viewPosition: 0.5 });
            }, 100);
        }
    }, [visible, startIdx]);

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);

        if (roundIndex !== currentIndex && roundIndex >= 0 && roundIndex < images.length) {
            setCurrentIndex(roundIndex);
            thumbListRef.current?.scrollToIndex({ index: roundIndex, animated: true, viewPosition: 0.5 });
        }
    };

    const next = () => {
        if (currentIndex < images.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            mainListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
            thumbListRef.current?.scrollToIndex({ index: nextIdx, animated: true, viewPosition: 0.5 });
        }
    };

    const prev = () => {
        if (currentIndex > 0) {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            mainListRef.current?.scrollToIndex({ index: prevIdx, animated: true });
            thumbListRef.current?.scrollToIndex({ index: prevIdx, animated: true, viewPosition: 0.5 });
        }
    };

    const selectImage = (index: number) => {
        setCurrentIndex(index);
        mainListRef.current?.scrollToIndex({ index, animated: true });
        thumbListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 py-4 z-10">
                    <Text className="text-white/70 text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-white/10 rounded-full p-2"
                        activeOpacity={0.7}
                    >
                        <X size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Main Image Slider */}
                <View className="flex-1 justify-center relative">
                    <FlatList
                        ref={mainListRef}
                        data={images}
                        keyExtractor={(_, i) => i.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleScroll}
                        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                        initialScrollIndex={startIdx}
                        renderItem={({ item }) => (
                            <View style={{ width, height: height * 0.6 }} className="justify-center items-center">
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                />
                            </View>
                        )}
                    />

                    {/* Navigation Arrows (Optional on mobile due to swiping, but good for parity) */}
                    {Platform.OS === 'web' || width > 600 ? (
                        <>
                            {currentIndex > 0 && (
                                <TouchableOpacity onPress={prev} className="absolute left-4 bg-white/10 p-3 rounded-full">
                                    <ChevronLeft size={28} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {currentIndex < images.length - 1 && (
                                <TouchableOpacity onPress={next} className="absolute right-4 bg-white/10 p-3 rounded-full">
                                    <ChevronRight size={28} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </>
                    ) : null}
                </View>

                {/* Thumbnail Strip */}
                <View className="py-4 px-2">
                    <FlatList
                        ref={thumbListRef}
                        data={images}
                        keyExtractor={(_, i) => i.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={startIdx}
                        getItemLayout={(_, index) => ({ length: 76, offset: 76 * index, index })} // 64px width + 12px margin
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => selectImage(index)}
                                activeOpacity={0.8}
                                className={`w-16 h-16 rounded-xl overflow-hidden mx-1.5 border-2 ${index === currentIndex ? 'border-white opacity-100' : 'border-transparent opacity-50'
                                    }`}
                            >
                                <Image source={{ uri: item }} style={{ width: '100%', height: '100%' }} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
}
