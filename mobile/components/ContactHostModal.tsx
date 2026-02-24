import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { api } from '../services/api';
import Button from './Button';

interface ContactHostModalProps {
    visible: boolean;
    host: { name: string };
    propertyName: string;
    propertyId: string;
    hostId: string;
    guestName: string;
    onClose: () => void;
    onNavigate?: (route: string) => void;
}

export default function ContactHostModal({
    visible, host, propertyName, propertyId, hostId, guestName, onClose, onNavigate
}: ContactHostModalProps) {
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        try {
            await api.sendMessage(
                propertyId,
                hostId,
                host.name,
                message.trim()
            );
            setSent(true);
        } catch (err) {
            console.error("Failed to send message:", err);
            // Ideally use a Toast here
            alert("Failed to send message. Please log in or try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMessage('');
        setSent(false);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-stone-900/60 justify-center items-center p-4"
            >
                <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                    <View className="bg-emerald-900 px-6 py-5 flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-white">Contact Host</Text>
                        <TouchableOpacity onPress={handleClose} className="p-1 rounded-full">
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24 }}>
                        {sent ? (
                            <View className="items-center py-4">
                                <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                                    <Send size={32} color="#047857" />
                                </View>
                                <Text className="text-xl font-bold text-stone-900 mb-2">Message Sent!</Text>
                                <Text className="text-stone-500 mb-8 text-center leading-relaxed">
                                    {host.name} usually replies within a few hours. We'll notify you when they respond.
                                </Text>

                                <View className="w-full space-y-3">
                                    {!!onNavigate && (
                                        <Button
                                            title="Go to Inbox"
                                            variant="outline"
                                            onPress={() => { handleClose(); onNavigate('inbox'); }}
                                            className="mb-3"
                                        />
                                    )}
                                    <Button title="Done" onPress={handleClose} />
                                </View>
                            </View>
                        ) : (
                            <View>
                                <View className="flex-row items-center p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-6">
                                    <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mr-4">
                                        <Text className="text-emerald-800 font-bold text-lg">{host.name.charAt(0)}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-stone-900 text-base">{host.name}</Text>
                                        <Text className="text-xs text-stone-500 mt-1">{propertyName}</Text>
                                    </View>
                                </View>

                                <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
                                    Your Message
                                </Text>
                                <TextInput
                                    multiline
                                    numberOfLines={5}
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Hi! I'm interested in your property and have a few questions..."
                                    className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 text-stone-900 mb-8 w-full text-base min-h-[120px]"
                                    textAlignVertical="top"
                                />

                                <View className="flex-row space-x-3 w-full">
                                    <Button
                                        title="Cancel"
                                        variant="outline"
                                        onPress={handleClose}
                                        className="flex-1 mr-2"
                                    />
                                    <Button
                                        title={loading ? "Sending..." : "Send Message"}
                                        variant="orange"
                                        onPress={handleSend}
                                        disabled={!message.trim() || loading}
                                        loading={loading}
                                        className="flex-1"
                                    />
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
