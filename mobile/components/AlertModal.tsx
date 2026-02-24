import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';

interface AlertModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'error' | 'success';
    onClose: () => void;
}

export default function AlertModal({ isOpen, title, message, type = 'error', onClose }: AlertModalProps) {
    if (!isOpen) return null;

    const isError = type === 'error';

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-stone-900/80 justify-center items-center p-5">
                <View className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 items-center pt-8 pb-6">
                    <View className={`w-16 h-16 rounded-full items-center justify-center mb-5 ${isError ? 'bg-red-100' : 'bg-emerald-100'
                        }`}>
                        {isError ? (
                            <AlertCircle size={32} color="#dc2626" />
                        ) : (
                            <CheckCircle2 size={32} color="#059669" />
                        )}
                    </View>

                    <Text className="text-xl font-bold text-stone-900 mb-2 text-center">
                        {title || (isError ? 'Oops!' : 'Success!')}
                    </Text>

                    <Text className="text-stone-600 font-medium mb-8 text-center text-base leading-relaxed">
                        {message}
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onClose}
                        className={`w-full py-3.5 rounded-xl items-center shadow-sm ${isError ? 'bg-stone-900' : 'bg-emerald-700'
                            }`}
                    >
                        <Text className="text-white font-bold text-base">Okay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
