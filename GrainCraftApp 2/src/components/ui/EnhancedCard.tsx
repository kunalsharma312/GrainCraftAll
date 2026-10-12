import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';
import theme from '../../assets/theme.json';

interface EnhancedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'warm' | 'outlined' | 'elevated';
  style?: ViewStyle;
  pressable?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  onPress,
  variant = 'default',
  style,
  pressable = false,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const shadowValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shadowValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shadowValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warm':
        return {
          backgroundColor: theme.colors.surfaceWarm,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: '#FFE082',
        };
      case 'outlined':
        return {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
        };
      case 'elevated':
        return {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        };
    }
  };

  const shadowOpacity = shadowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [variant === 'elevated' ? 0.15 : 0.08, 0.25],
  });

  const containerComponent = (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          getVariantStyles(),
          {
            shadowOpacity: variant !== 'outlined' ? shadowOpacity : 0,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {containerComponent}
      </TouchableOpacity>
    );
  }

  return containerComponent;
};
