import { View, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../theme';

interface AppCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'warm' | 'outlined';
  style?: ViewStyle;
}

export default function AppCard({ children, variant = 'default', style }: AppCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warm':
        return {
          backgroundColor: theme.colors.surfaceWarm,
          borderWidth: 1,
          borderColor: '#FFE082',
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.border,
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyles(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.components.card.borderRadius,
    padding: 15,
  },
});
