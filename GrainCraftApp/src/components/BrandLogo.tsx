import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import theme from '../theme';
import ThemedText from './ThemedText';

interface BrandLogoProps {
  compact?: boolean;
}

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  const [remoteLogoFailed, setRemoteLogoFailed] = useState(false);
  const logoUrl = theme.logo.url;
  const hasValidLogoUrl = typeof logoUrl === 'string' && /^https?:\/\//i.test(logoUrl);
  const showRemoteLogo = hasValidLogoUrl && !remoteLogoFailed;

  return (
    <View style={styles.container}>
      {showRemoteLogo ? (
        <Image
          source={{ uri: logoUrl }}
          style={compact ? styles.remoteCompact : styles.remote}
          resizeMode="contain"
          accessibilityLabel={`${theme.brand.name} logo`}
          onError={() => setRemoteLogoFailed(true)}
        />
      ) : (
        <>
          <ThemedText style={compact ? styles.symbolCompact : styles.symbol} accessibilityLabel="GrainCraft local logo">
            {theme.logo.fallback.symbol}
          </ThemedText>
          <View>
            <ThemedText style={compact ? styles.brandCompact : styles.brand}>{theme.logo.fallback.name}</ThemedText>
            {!compact && <ThemedText style={styles.tagline}>{theme.brand.tagline}</ThemedText>}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  remote: { width: 170, height: 48 },
  remoteCompact: { width: 100, height: 32 },
  symbol: { fontSize: theme.typography.fontSize.display, marginRight: 8 },
  symbolCompact: { fontSize: theme.typography.fontSize.headingSmall, marginRight: 5 },
  brand: { fontSize: theme.typography.fontSize.heading, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  brandCompact: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  tagline: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary },
});
