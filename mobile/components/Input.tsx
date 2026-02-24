import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    className?: string;
}

export default function Input({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    error,
    className = '',
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = secureTextEntry;

    return (
        <View className={`mb-4 ${className}`}>
            {label && (
                <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    {label}
                </Text>
            )}
            <View className="relative justify-center">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#a8a29e"
                    secureTextEntry={isPassword && !showPassword}
                    className={`w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-900 ${isPassword ? 'pr-12' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4"
                    >
                        {showPassword ? <EyeOff size={20} color="#a8a29e" /> : <Eye size={20} color="#a8a29e" />}
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text className="text-sm text-red-600 mt-1">{error}</Text>}
        </View>
    );
}
