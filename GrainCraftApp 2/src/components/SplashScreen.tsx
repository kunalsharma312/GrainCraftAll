import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import theme from '../assets/theme.json';
import Text from './ThemedText';

interface SplashScreenProps {
  isVisible: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
  const fadeOutValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isVisible) {
      Animated.parallel([
        Animated.timing(fadeOutValue, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeOutValue.setValue(1);
      scaleValue.setValue(0.8);
    }
  }, [isVisible]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateValue]);

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeOutValue,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logo,
            {
              transform: [
                { scale: scaleValue },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <Text style={styles.logoText}>🌾</Text>
        </Animated.View>
        <Text style={styles.title}>GrainCraft</Text>
        <Text style={styles.subtitle}>Fresh Stone-Milled Flour</Text>
        <View style={styles.loader}>
          <Animated.View
            style={[
              styles.loaderBar,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  loader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.border,
    borderTopColor: theme.colors.primary,
  },
  loaderBar: {
    width: '100%',
    height: '100%',
  },
});
