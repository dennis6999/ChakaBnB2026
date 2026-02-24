import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Settings, Shield, LogOut, ChevronRight, Edit2, Check, X } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import Button from '../../components/Button';

export default function ProfileScreen() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Edit state
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);

    const checkUser = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
    };

    useEffect(() => {
        checkUser();
        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    // Initialize edit fields when entering edit mode
    useEffect(() => {
        if (editMode && session?.user) {
            setEditName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '');
            setEditPhone(session.user.user_metadata?.phone || '');
        }
    }, [editMode, session]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await checkUser();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            await api.updateUserProfile(editName, editPhone);
            await checkUser(); // refresh session data locally
            setEditMode(false);
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setSaving(false);
        }
    };

    if (!session) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center p-6">
                <View className="w-24 h-24 bg-stone-200 rounded-full items-center justify-center mb-6">
                    <User size={40} color="#a8a29e" />
                </View>
                <Text className="text-2xl font-black text-stone-900 mb-2">Your Profile</Text>
                <Text className="text-stone-500 text-center mb-8">
                    Log in to start planning your next trip and manage your bookings.
                </Text>
                <Button
                    title="Log in or sign up"
                    onPress={() => router.push('/auth')}
                    className="w-full"
                />
            </SafeAreaView>
        );
    }

    const user = session.user;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || 'Guest User';
    const initials = name.charAt(0).toUpperCase();

    return (
        <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                <View className="flex-row justify-between items-end mb-8">
                    <Text className="text-3xl font-black text-stone-900 tracking-tight">Profile</Text>
                    {!editMode ? (
                        <TouchableOpacity
                            onPress={() => setEditMode(true)}
                            className="bg-emerald-100 px-3 py-1.5 rounded-full flex-row items-center mb-1"
                        >
                            <Edit2 size={14} color="#059669" />
                            <Text className="text-emerald-800 font-bold text-xs ml-1.5">Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setEditMode(false)}
                            className="bg-stone-200 px-3 py-1.5 rounded-full flex-row items-center mb-1"
                        >
                            <X size={14} color="#57534e" />
                            <Text className="text-stone-700 font-bold text-xs ml-1.5">Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {editMode ? (
                    <View className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm mb-8">
                        <Text className="text-lg font-black text-stone-900 mb-4">Edit Information</Text>

                        <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Full Name</Text>
                        <TextInput
                            value={editName}
                            onChangeText={setEditName}
                            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-900 mb-4"
                            placeholder="Your Name"
                        />

                        <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Phone Number</Text>
                        <TextInput
                            value={editPhone}
                            onChangeText={setEditPhone}
                            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-900 mb-6"
                            placeholder="+254..."
                            keyboardType="phone-pad"
                        />

                        <TouchableOpacity
                            onPress={handleSaveProfile}
                            disabled={saving}
                            className={`flex-row justify-center items-center rounded-xl py-4 ${saving ? 'bg-emerald-800' : 'bg-emerald-600'}`}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Check size={20} color="#fff" />
                                    <Text className="text-white font-black text-base ml-2">Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex-row items-center mb-8">
                        <View className="w-16 h-16 bg-emerald-900 rounded-full items-center justify-center mr-4">
                            <Text className="text-white font-bold text-xl">{initials}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-stone-900 mb-1">{name}</Text>
                            <Text className="text-sm text-stone-500">{user.email}</Text>
                            {user.user_metadata?.phone && (
                                <Text className="text-sm text-stone-500">{user.user_metadata.phone}</Text>
                            )}
                        </View>
                    </View>
                )}

                <View className="mb-6">
                    <Text className="text-lg font-black text-stone-900 mb-3 ml-2">Account Settings</Text>

                    <View className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                        {[
                            { icon: <User size={20} color="#44403c" />, title: 'Personal Information' },
                            { icon: <Shield size={20} color="#44403c" />, title: 'Login & Security' },
                            { icon: <Settings size={20} color="#44403c" />, title: 'Preferences' },
                        ].map((item, i) => (
                            <View
                                key={i}
                                className={`flex-row items-center justify-between p-4 ${i !== 2 ? 'border-b border-stone-100' : ''}`}
                            >
                                <View className="flex-row items-center">
                                    {item.icon}
                                    <Text className="text-base font-bold text-stone-700 ml-3">{item.title}</Text>
                                </View>
                                <ChevronRight size={20} color="#a8a29e" />
                            </View>
                        ))}
                    </View>
                </View>

                <Button
                    title="Switch to Hosting"
                    variant="outline"
                    onPress={() => router.push('/host')}
                    className="mb-4"
                />

                <Button
                    title="Log Out"
                    variant="outline"
                    onPress={handleLogout}
                    className="border-red-200"
                />
            </ScrollView>
        </SafeAreaView>
    );
}
