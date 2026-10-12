import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import theme from '../../assets/theme.json';
import Text from '../ThemedText';

interface EnhancedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 24, minHeight: 56 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 16, minHeight: 48 };
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: 12,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: disabled ? '#CCCCCC' : theme.colors.primary,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: disabled ? '#EEEEEE' : '#F5F3F0',
          borderWidth: 2,
          borderColor: disabled ? '#CCCCCC' : theme.colors.primary,
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: disabled ? '#CCCCCC' : '#4CAF50',
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: disabled ? '#CCCCCC' : '#EF5350',
        };
      case 'text':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyles;
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary' || variant === 'text') {
      return disabled ? '#CCCCCC' : theme.colors.primary;
    }
    return '#FFFFFF';
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
          width: fullWidth ? '100%' : 'auto',
        },
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          getSizeStyles(),
          getVariantStyles(),
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                {
                  color: getTextColor(),
                  fontSize: size === 'large' ? 16 : 14,
                  fontWeight: '600',
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
