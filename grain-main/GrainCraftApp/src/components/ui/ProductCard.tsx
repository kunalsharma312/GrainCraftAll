import { Image, StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import { useRef, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import type { DiscoverItem } from '../../services/types';
import theme from '../../theme';
import Text from '../ThemedText';
import shareService from '../../services/shareService';
import hapticsService from '../../services/hapticsService';
import { EnhancedCard } from './EnhancedCard';
import { EnhancedButton } from './EnhancedButton';

interface ProductCardProps {
  item: DiscoverItem;
  onAdd: (item: DiscoverItem) => void;
}

export default function ProductCard({ item, onAdd }: ProductCardProps) {
  const fadeInValue = useRef(new Animated.Value(0)).current;
  const translateValue = useRef(new Animated.Value(50)).current;

  const handleShare = () => {
    hapticsService.selection();
    shareService.shareProduct({
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      price: item.price,
    });
  };

  const handleAdd = () => {
    hapticsService.addToCart();
    onAdd(item as any);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeInValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeInValue, translateValue]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeInValue,
          transform: [{ translateY: translateValue }],
        },
        styles.container,
      ]}
    >
      <EnhancedCard variant="default" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageBadge}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.footer}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.shareButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Share ${item.name}`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="share" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <EnhancedButton
                  title="Add"
                  onPress={handleAdd}
                  variant="primary"
                  size="small"
                  style={styles.button}
                />
              </View>
            </View>
          </View>
        </View>
      </EnhancedCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  card: { overflow: 'hidden' },
  row: { flexDirection: 'row', gap: 12 },
  imageContainer: { position: 'relative', width: 120, height: 150, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  imageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'space-between' },
  name: {
    fontSize: theme.typography.fontSize.bodyLarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  tagsContainer: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tag: { backgroundColor: '#F5F3F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F5F3F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: { paddingVertical: 6, paddingHorizontal: 12 },
});
