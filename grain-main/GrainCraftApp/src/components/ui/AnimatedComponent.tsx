import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedComponentProps {
  children: React.ReactNode;
  duration?: number;
  type?: 'fadeIn' | 'scaleIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  style?: ViewStyle;
}

export const AnimatedComponent: React.FC<AnimatedComponentProps> = ({
  children,
  duration = 300,
  type = 'fadeIn',
  delay = 0,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedValue, duration, delay]);

  const getAnimatedStyle = () => {
    switch (type) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
        };
      case 'scaleIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        };
      case 'slideInUp':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'slideInDown':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      case 'slideInLeft':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      case 'slideInRight':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      default:
        return { opacity: animatedValue };
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

interface PulseAnimationProps {
  children: React.ReactNode;
  duration?: number;
  style?: ViewStyle;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  duration = 2000,
  style,
}) => {
  const pulseValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.8,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseValue, duration]);

  return (
    <Animated.View
      style={[
        {
          opacity: pulseValue,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface BounceAnimationProps {
  children: React.ReactNode;
  duration?: number;
  style?: ViewStyle;
}

export const BounceAnimation: React.FC<BounceAnimationProps> = ({
  children,
  duration = 1000,
  style,
}) => {
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceValue, duration]);

  const bounceHeight = bounceValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: bounceHeight }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ShakeAnimationProps {
  children: React.ReactNode;
  trigger?: boolean;
  duration?: number;
  style?: ViewStyle;
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  trigger = false,
  duration = 400,
  style,
}) => {
  const shakeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(shakeValue, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        shakeValue.setValue(0);
      });
    }
  }, [trigger, shakeValue]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: shakeValue }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
