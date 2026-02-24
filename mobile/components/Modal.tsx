import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { X } from 'lucide-react-native';

export default function Modal({ visible, onClose, children }) {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <TouchableWithoutFeedback>
                        <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative">
                            <TouchableOpacity
                                onPress={onClose}
                                className="absolute top-4 right-4 z-10 w-8 h-8 bg-stone-100 rounded-full items-center justify-center"
                            >
                                <X size={20} color="#44403c" />
                            </TouchableOpacity>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
}
