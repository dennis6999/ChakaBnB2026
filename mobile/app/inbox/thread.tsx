import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';

export default function ThreadScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [session, setSession] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const propertyId = params.propertyId as string;
    const otherId = params.otherId as string;
    const otherName = params.otherName as string;
    const propertyName = params.propertyName as string;

    useEffect(() => {
        loadThread();
        // Set up real-time subscription
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `property_id=eq.${propertyId}`
                },
                (payload) => {
                    const msg = payload.new;
                    // Only add if it belongs to this conversation
                    if ((msg.sender_id === otherId) || (msg.receiver_id === otherId)) {
                        setMessages(prev => [...prev, msg]);
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [propertyId, otherId]);

    const loadThread = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);

            if (data.session) {
                const userId = data.session.user.id;

                // Fetch messages for this specific conversation thread
                const { data: threadMsgs, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('property_id', propertyId)
                    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(threadMsgs || []);

                // Mark as read
                await api.markMessagesAsRead(otherId, propertyId);
            }
        } catch (err) {
            console.error("Error loading thread:", err);
        } finally {
            setLoading(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !session) return;

        const tempText = newMessage.trim();
        setNewMessage('');

        try {
            await api.sendMessage(propertyId, otherId, otherName, tempText);
            // Re-fetch to ensure sync, or rely on realtime
            // The realtime sub will pick up our own message too.
        } catch (err) {
            console.error("Failed to send:", err);
            // Optionally restore text
            setNewMessage(tempText);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-50" edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View className="px-4 py-3 bg-white border-b border-stone-200 flex-row items-center shadow-sm z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <ChevronLeft size={24} color="#1c1917" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-lg font-black text-stone-900">{otherName}</Text>
                        <Text className="text-xs text-stone-500 font-bold uppercase tracking-wider">{propertyName}</Text>
                    </View>
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingVertical: 20 }}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {loading ? (
                        <ActivityIndicator color="#059669" className="mt-10" />
                    ) : messages.length === 0 ? (
                        <View className="items-center justify-center py-10 opacity-50">
                            <Text className="text-stone-500 font-medium pb-2 text-center">Start the conversation</Text>
                            <Text className="text-xs text-stone-400 max-w-[80%] text-center">
                                Ask {otherName} about their property, availability, or any other details.
                            </Text>
                        </View>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender_id === session?.user?.id;
                            const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.sender_id !== msg.sender_id);

                            return (
                                <View key={msg.id} className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {!isMe && (
                                        <View className="w-8 h-8 rounded-full bg-stone-200 items-center justify-center mr-2 self-end mb-1">
                                            {showAvatar && <Text className="font-bold text-stone-600 text-xs">{otherName.charAt(0)}</Text>}
                                        </View>
                                    )}
                                    <View className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe ? 'bg-emerald-600 rounded-br-sm' : 'bg-white border border-stone-200 rounded-bl-sm shadow-sm'}`}>
                                        <Text className={`${isMe ? 'text-white' : 'text-stone-800'} text-base leading-snug`}>
                                            {msg.content}
                                        </Text>
                                        <Text className={`text-[10px] mt-1 ${isMe ? 'text-emerald-200' : 'text-stone-400'} text-right`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>

                {/* Input area */}
                <View className="px-4 py-3 bg-white border-t border-stone-200 flex-row items-end">
                    <TextInput
                        className="flex-1 bg-stone-100 rounded-3xl px-5 py-3 text-stone-900 text-base max-h-32 mb-1"
                        placeholder="Type a message..."
                        placeholderTextColor="#a8a29e"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!newMessage.trim()}
                        className={`w-12 h-12 rounded-full items-center justify-center ml-3 mb-1 ${newMessage.trim() ? 'bg-emerald-600' : 'bg-stone-200'}`}
                    >
                        <Send size={20} color={newMessage.trim() ? '#fff' : '#a8a29e'} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
