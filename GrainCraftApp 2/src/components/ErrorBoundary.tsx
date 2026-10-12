import React, { ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../assets/theme.json';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            backgroundColor: theme.colors.background,
          }}
        >
          <MaterialIcons
            name="error-outline"
            size={64}
            color={theme.colors.error || '#EF5350'}
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
            Something went wrong
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary || '#999',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            {this.state.error.message}
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: theme.colors.primary,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
