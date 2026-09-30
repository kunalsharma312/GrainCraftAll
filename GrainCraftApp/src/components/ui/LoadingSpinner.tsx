import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../assets/theme.json';

interface LoadingSpinnerProps {
  visible?: boolean;
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible = true,
  message,
  size = 'large',
  fullScreen = false,
}) => {
  if (!visible) {
    return null;
  }

  const containerStyle: ViewStyle = fullScreen
    ? {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }
    : {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
      };

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && (
        <Text
          style={{
            marginTop: 12,
            fontSize: 14,
            color: theme.colors.textSecondary || '#999',
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error || '#EF5350',
        marginVertical: 12,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: '#C62828',
          marginBottom: onRetry ? 12 : 0,
        }}
      >
        {message}
      </Text>
      {onRetry && (
        <Text
          onPress={onRetry}
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.primary,
          }}
        >
          Retry
        </Text>
      )}
    </View>
  );
};
