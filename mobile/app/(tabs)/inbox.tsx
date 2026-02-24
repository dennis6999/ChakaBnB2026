import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import Button from '../../components/Button';

export default function InboxScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [session, setSession] = useState<any>(null);

    const loadData = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);

            if (data.session) {
                const msgs = await api.getUserConversations();
                const userId = data.session.user.id;

                // Group by conversation
                const grouped: Record<string, any> = {};
                msgs.forEach(msg => {
                    const otherUser = msg.sender_id === userId ? msg.receiver_name : msg.sender_name;
                    const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
                    const propId = msg.property_id;
                    const key = `${propId}-${otherId}`;

                    if (!grouped[key] || new Date(msg.created_at) > new Date(grouped[key].created_at)) {
                        grouped[key] = {
                            ...msg,
                            threadKey: key,
                            otherName: otherUser || 'User',
                            otherId: otherId,
                            unread: !msg.read && msg.receiver_id === userId
                        };
                    } else if (!msg.read && msg.receiver_id === userId) {
                        // Persist unread status if any message in thread is unread
                        grouped[key].unread = true;
                    }
                });

                setConversations(
                    Object.values(grouped).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Load initially
        loadData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (!session && !loading) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center p-6">
                <View className="w-24 h-24 bg-stone-200 rounded-full items-center justify-center mb-6">
                    <MessageSquare size={40} color="#a8a29e" />
                </View>
                <Text className="text-2xl font-black text-stone-900 mb-2">Log in to view messages</Text>
                <Text className="text-stone-500 text-center mb-8">
                    Once you log in, you can contact hosts and view your conversations.
                </Text>
                <Button title="Log in" onPress={() => router.push('/auth')} className="w-full" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
            <View className="px-5 pt-4 pb-2 bg-white border-b border-stone-200 shadow-sm z-10">
                <Text className="text-3xl font-black text-stone-900 tracking-tight">Inbox</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#059669" className="mt-10" />
                ) : conversations.length === 0 ? (
                    <View className="bg-white border border-stone-200 rounded-3xl p-6 items-center shadow-sm mt-4">
                        <View className="w-20 h-20 bg-stone-100 rounded-full items-center justify-center mb-6">
                            <MessageSquare size={32} color="#44403c" />
                        </View>
                        <Text className="text-xl font-bold text-stone-900 mb-2 text-center">No messages yet</Text>
                        <Text className="text-stone-500 text-center mb-6 px-4">
                            When you contact a host or receive a message, it will appear here.
                        </Text>
                        <Button title="Explore ChakaBnB" onPress={() => router.push('/')} />
                    </View>
                ) : (
                    conversations.map(conv => (
                        <TouchableOpacity
                            key={conv.threadKey}
                            activeOpacity={0.7}
                            onPress={() => router.push({
                                pathname: '/inbox/thread',
                                params: { propertyId: conv.property_id, otherId: conv.otherId, otherName: conv.otherName, propertyName: conv.properties?.name }
                            })}
                            className={`bg-white border rounded-3xl p-4 mb-4 shadow-sm flex-row items-center ${conv.unread ? 'border-emerald-300 bg-emerald-50/30' : 'border-stone-200'}`}
                        >
                            <View className="w-14 h-14 bg-stone-200 rounded-full items-center justify-center mr-4">
                                <Text className="text-stone-700 font-bold text-lg">{conv.otherName.charAt(0)}</Text>
                                {conv.unread && (
                                    <View className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                                )}
                            </View>
                            <View className="flex-1">
                                <View className="flex-row justify-between items-start mb-1">
                                    <Text className={`text-lg leading-tight truncate mr-2 flex-1 ${conv.unread ? 'font-black text-emerald-900' : 'font-bold text-stone-900'}`}>
                                        {conv.otherName}
                                    </Text>
                                    <Text className="text-xs text-stone-400 font-medium shrink-0 mt-0.5">
                                        {new Date(conv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                                <Text className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">
                                    {conv.properties?.name || 'Property Inquiry'}
                                </Text>
                                <Text className={`text-sm line-clamp-1 ${conv.unread ? 'text-stone-800 font-medium' : 'text-stone-500'}`} numberOfLines={1}>
                                    {conv.sender_id === session?.user?.id ? 'You: ' : ''}{conv.content}
                                </Text>
                            </View>
                            <ChevronRight size={20} color="#a8a29e" className="ml-2" />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
