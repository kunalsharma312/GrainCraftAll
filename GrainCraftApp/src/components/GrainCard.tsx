/**
 * GrainCard Component
 * Displays grain information with image, pricing, and category badge
 */

import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import Text from './ThemedText';
import theme from '../theme';
import { imageService } from '../services/imageService';

interface GrainCardProps {
  id: string;
  grain: string;
  price: number | string;
  discount: number | string;
  delivery_charge: number | string;
  city: string;
  state: string;
  onPress?: () => void;
  showCategory?: boolean;
  imageSize?: 'small' | 'medium' | 'large';
}

export const GrainCard: React.FC<GrainCardProps> = ({
  id,
  grain,
  price,
  discount,
  delivery_charge,
  city,
  state,
  onPress,
  showCategory = true,
  imageSize = 'medium',
}) => {
  const priceNum = parseInt(price as string) || 0;
  const discountNum = parseInt(discount as string) || 0;
  const deliveryNum = parseInt(delivery_charge as string) || 0;

  const priceAfterDiscount = Math.round(priceNum - (priceNum * discountNum / 100));
  const finalPrice = priceAfterDiscount + deliveryNum;

  const imageUrl = imageService.getImageUrl(grain);
  const category = imageService.getCategoryName(grain);
  const icon = imageService.getCategoryIcon(grain);
  const categoryColor = imageService.getCategoryColor(grain);

  const imageSizeMap = {
    small: 60,
    medium: 100,
    large: 140,
  };

  const imagePixels = imageSizeMap[imageSize];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: imagePixels, height: imagePixels }]}
          defaultSource={require('../assets/mockData.json')}
        />
        
        {/* Discount Badge */}
        {discountNum > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: '#FF6B6B' }]}>
            <Text style={styles.discountText}>{discountNum}%</Text>
          </View>
        )}

        {/* Category Badge */}
        {showCategory && (
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{icon}</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        {/* Grain Name */}
        <Text style={styles.grainName} numberOfLines={2}>
          {grain}
        </Text>

        {/* Category */}
        {showCategory && (
          <Text style={styles.categoryLabel}>
            {icon} {category}
          </Text>
        )}

        {/* Location */}
        <Text style={styles.location}>
          📍 {city}, {state}
        </Text>

        {/* Pricing Section */}
        <View style={styles.pricingContainer}>
          {/* Original Price */}
          {discountNum > 0 && (
            <Text style={styles.originalPrice}>
              ₹{priceNum}
            </Text>
          )}

          {/* Final Price */}
          <View style={styles.finalPriceContainer}>
            <Text style={styles.finalPrice}>₹{finalPrice}</Text>
            {deliveryNum > 0 && (
              <Text style={styles.deliveryText}>
                (₹{deliveryNum} delivery)
              </Text>
            )}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Base</Text>
            <Text style={styles.breakdownValue}>₹{priceNum}</Text>
          </View>
          {discountNum > 0 && (
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Discount</Text>
              <Text style={styles.breakdownValue}>-₹{priceNum - priceAfterDiscount}</Text>
            </View>
          )}
          {deliveryNum > 0 && (
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Delivery</Text>
              <Text style={styles.breakdownValue}>+₹{deliveryNum}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    minHeight: 120,
  },
  image: {
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 16,
  },
  infoContainer: {
    padding: 12,
  },
  grainName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  location: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  pricingContainer: {
    marginVertical: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  finalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C00',
  },
  deliveryText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  breakdownLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

export default GrainCard;
