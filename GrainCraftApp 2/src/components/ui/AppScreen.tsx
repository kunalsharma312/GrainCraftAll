import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import theme from '../../theme';

interface AppScreenProps extends PropsWithChildren, ScrollViewProps {
  contentStyle?: StyleProp<ViewStyle>;
}

export default function AppScreen({ children, contentStyle, ...scrollProps }: AppScreenProps) {
  return (
    <ScrollView {...scrollProps} contentContainerStyle={[styles.content, contentStyle]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 15, paddingBottom: 30, backgroundColor: theme.colors.background },
});
