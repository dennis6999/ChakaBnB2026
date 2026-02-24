import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
    onPress?: () => void;
    title?: string;
    variant?: 'primary' | 'secondary' | 'orange' | 'outline';
    loading?: boolean;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    [x: string]: any;
}

export default function Button({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    className = '',
    children,
    disabled = false,
    ...props
}: ButtonProps) {
    const baseClasses = "flex-row items-center justify-center py-3.5 px-6 rounded-xl";
    const variants = {
        primary: "bg-emerald-600",
        secondary: "bg-stone-900",
        orange: "bg-orange-600",
        outline: "bg-transparent border-2 border-stone-200"
    };

    const textVariants = {
        primary: "text-white font-bold text-center text-base",
        secondary: "text-white font-bold text-center text-base",
        orange: "text-white font-bold text-center text-base",
        outline: "text-stone-700 font-bold text-center text-base"
    };

    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            className={`${baseClasses} ${variants[variant]} ${isDisabled ? 'opacity-70' : ''} ${className}`}
            {...props}
        >
            {loading && (
                <ActivityIndicator color={variant === 'outline' ? '#44403c' : '#fff'} className="mr-2" />
            )}
            {children || <Text className={textVariants[variant]}>{title}</Text>}
        </TouchableOpacity>
    );
}
