import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../assets/theme.json';

interface EmptyStateFallbackProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyStateFallback: React.FC<EmptyStateFallbackProps> = ({
  icon = 'inbox',
  title,
  message,
  action,
}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
      }}
    >
      <MaterialIcons
        name={icon as any}
        size={64}
        color={theme.colors.textSecondary || '#CCC'}
        style={{ marginBottom: 16 }}
      />
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary || '#999',
            marginBottom: action ? 24 : 0,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
      {action && (
        <Text
          onPress={action.onPress}
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          {action.label}
        </Text>
      )}
    </View>
  );
};
