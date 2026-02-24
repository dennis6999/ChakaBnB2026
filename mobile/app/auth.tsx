import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { api } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function AuthScreen() {
    const router = useRouter();
    const { returnTo } = useLocalSearchParams();
    const [tab, setTab] = useState('login');

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async () => {
        setError('');
        setLoading(true);

        try {
            if (tab === 'login') {
                await api.login(form.email, form.password);
            } else {
                if (form.password !== form.confirm) throw new Error("Passwords must match.");
                await api.signup(form.name, form.email, form.password);
            }

            if (returnTo) {
                router.replace(returnTo as any);
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="px-4 py-3 flex-row items-center border-b border-stone-100">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <X size={24} color="#1c1917" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-stone-900 ml-4 flex-1 text-center pr-10">
                        Log in or sign up
                    </Text>
                </View>

                <ScrollView className="flex-1 px-6 pt-8">
                    <Text className="text-2xl font-black text-stone-900 mb-6 tracking-tight">
                        Welcome to ChakaBnB
                    </Text>

                    <View className="flex-row bg-stone-100 rounded-xl p-1 mb-6">
                        <TouchableOpacity
                            onPress={() => setTab('login')}
                            className={`flex-1 py-3 rounded-lg items-center ${tab === 'login' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`font-bold ${tab === 'login' ? 'text-stone-900' : 'text-stone-500'}`}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setTab('signup')}
                            className={`flex-1 py-3 rounded-lg items-center ${tab === 'signup' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`font-bold ${tab === 'signup' ? 'text-stone-900' : 'text-stone-500'}`}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={async () => {
                            setLoading(true);
                            setError('');
                            try {
                                await api.signInWithGoogle();
                                if (returnTo) router.replace(returnTo as any);
                                else router.push('/');
                            } catch (err: any) {
                                // Ignore if user cancelled
                                if (err.message && err.message.includes('cancelled')) return;
                                setError(err.message || 'Failed to connect to Google.');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="flex-row items-center justify-center bg-white border border-stone-200 py-3.5 rounded-xl mb-6 shadow-sm"
                    >
                        <View className="mr-3 w-6 h-6 items-center justify-center">
                            <Text className="font-bold text-lg" style={{ color: '#4285F4' }}>G</Text>
                        </View>
                        <Text className="text-stone-700 font-bold text-base">Continue with Google</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-[1px] bg-stone-200" />
                        <Text className="mx-4 text-stone-500 font-semibold text-sm">Or with email</Text>
                        <View className="flex-1 h-[1px] bg-stone-200" />
                    </View>

                    {error ? <Text className="text-red-600 font-bold mb-4">{error}</Text> : null}

                    {tab === 'signup' && (
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                        />
                    )}

                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        value={form.email}
                        onChangeText={(t) => setForm({ ...form, email: t })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={form.password}
                        onChangeText={(t) => setForm({ ...form, password: t })}
                        secureTextEntry
                    />

                    {tab === 'signup' && (
                        <Input
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={form.confirm}
                            onChangeText={(t) => setForm({ ...form, confirm: t })}
                            secureTextEntry
                        />
                    )}

                    <Button
                        title={tab === 'login' ? "Log In" : "Sign Up"}
                        onPress={handleAuth}
                        loading={loading}
                        className="mt-4 shadow-sm"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
