import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  addToCart,
  incrementItem,
  decrementItem,
  removeFromCart,
  setItemQuantity,
  clearCart,
} from '../redux/slices/cartSlice';
import mockData from '../assets/mockData.json';
import { appConfig } from '../config/appConfig';
import { featureFlags } from '../config/featureFlags';
import hapticsService from '../services/hapticsService';
import orderEmailService, { SimpleOrder } from '../services/orderEmailService';

interface Grain {
  id: string;
  name: string;
  nameHindi?: string;
  subtitle: string;
  price: number;
  unit?: string;
  state?: string;
  category?: string;
  image?: string;
}

const grains: Grain[] = (mockData as any).grains || [];
const C = appConfig.colors;
const money = (n: number) => `${appConfig.currencySymbol}${n.toFixed(0)}`;
/** Quick bulk-add step (kg) shown as a "+5" button for large orders. */
const BULK_STEP = 5;

function tapFeedback() {
  if (featureFlags.ENABLE_HAPTICS) {
    hapticsService.selection();
  }
}

export default function SimpleHomeScreen() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);

  const [formVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  // Order form fields
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState<{ address?: string; pincode?: string; mobile?: string }>({});

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Delivery is free once the subtotal reaches the threshold.
  const deliveryCharge =
    subtotal > 0 && subtotal < appConfig.freeDeliveryThreshold ? appConfig.deliveryCharge : 0;
  const cartTotal = subtotal + deliveryCharge;
  const amountToFreeDelivery = Math.max(0, appConfig.freeDeliveryThreshold - subtotal);

  const quantityById = useMemo(() => {
    const map: Record<string, number> = {};
    cartItems.forEach(i => {
      map[i.id] = i.quantity;
    });
    return map;
  }, [cartItems]);

  const visibleGrains = useMemo(
    () =>
      activeCategory === 'all'
        ? grains
        : grains.filter(g => (g.category || 'flour') === activeCategory),
    [activeCategory]
  );

  const handleAdd = (grain: Grain) => {
    tapFeedback();
    dispatch(
      addToCart({
        id: grain.id,
        name: grain.name,
        subtitle: grain.subtitle,
        price: grain.price,
        image: grain.image,
      })
    );
  };

  const handleIncrement = (id: string) => {
    tapFeedback();
    dispatch(incrementItem(id));
  };

  const handleDecrement = (id: string) => {
    tapFeedback();
    const item = cartItems.find(i => i.id === id);
    if (item && item.quantity === 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(decrementItem(id));
    }
  };

  /** Add several kg in one tap (the "+5" bulk button). */
  const handleBulkAdd = (grain: Grain) => {
    tapFeedback();
    const existing = cartItems.find(i => i.id === grain.id);
    if (existing) {
      dispatch(setItemQuantity({ id: grain.id, quantity: existing.quantity + BULK_STEP }));
    } else {
      // Add the item, then bump straight to the bulk quantity.
      dispatch(
        addToCart({
          id: grain.id,
          name: grain.name,
          subtitle: grain.subtitle,
          price: grain.price,
          image: grain.image,
        })
      );
      dispatch(setItemQuantity({ id: grain.id, quantity: BULK_STEP }));
    }
  };

  const validate = (): boolean => {
    const next: typeof errors = {};

    if (!address.trim()) {
      next.address = 'Please enter your delivery address';
    }

    if (!pincode.trim()) {
      next.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      next.pincode = 'Enter a valid 6-digit pincode';
    }

    const digits = appConfig.phoneLocalDigits;
    if (!mobile.trim()) {
      next.mobile = 'Mobile number is required';
    } else if (!new RegExp(`^\\d{${digits}}$`).test(mobile.trim())) {
      next.mobile = `Enter a valid ${digits}-digit mobile number`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      if (featureFlags.ENABLE_HAPTICS) hapticsService.notify('error');
      return;
    }

    setSubmitting(true);

    const order: SimpleOrder = {
      items: cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      customer: {
        address: address.trim(),
        pincode: pincode.trim(),
        mobile: mobile.trim(),
      },
      subtotal,
      deliveryCharge,
      total: cartTotal,
      placedAt: new Date().toLocaleString(),
    };

    const result = await orderEmailService.placeOrder(order);
    setSubmitting(false);

    if (result.success) {
      if (featureFlags.ENABLE_HAPTICS) hapticsService.notify('success');
      dispatch(clearCart());
      setFormVisible(false);
      setAddress('');
      setPincode('');
      setMobile('');
      setErrors({});
      Alert.alert(
        'Order placed! 🌾',
        `Thanks! We've received your order${
          result.channel === 'email' ? ' and emailed the details to the shop' : ''
        }. We'll call you on ${appConfig.phoneCountryCode} ${order.customer.mobile} to confirm.`
      );
    } else {
      // Order still captured (console fallback) - inform gently.
      if (featureFlags.ENABLE_HAPTICS) hapticsService.notify('warning');
      Alert.alert(
        'Order received',
        result.error
          ? `Your order was recorded, but email delivery needs setup:\n\n${result.error}`
          : 'Your order was recorded.'
      );
      dispatch(clearCart());
      setFormVisible(false);
    }
  };

  const renderGrain = ({ item }: { item: Grain }) => {
    const qty = quantityById[item.id] || 0;
    const unit = item.unit || 'kg';
    const inCart = qty > 0;
    return (
      <View style={[styles.card, inCart && styles.cardActive]}>
        <View>
          <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.imageScrim} />
          {/* Veg mark - grains are always veg, adds a familiar Indian-grocery cue */}
          <View style={styles.vegMark}>
            <View style={styles.vegDot} />
          </View>
          {item.state ? (
            <View style={styles.stateBadge}>
              <Text style={styles.stateBadgeText}>📍 {item.state}</Text>
            </View>
          ) : null}
          {inCart ? (
            <View style={styles.inCartTick}>
              <Text style={styles.inCartTickText}>✓ {qty} {unit}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.nameHindi ? (
            <Text style={styles.cardNameHindi} numberOfLines={1}>
              {item.nameHindi}
            </Text>
          ) : null}
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardPrice}>{money(item.price)}</Text>
              <Text style={styles.cardPricePerUnit}>per {unit}</Text>
            </View>

            {qty === 0 ? (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAdd(item)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.name}`}
              >
                <Text style={styles.addBtnText}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleDecrement(item.id)}
                  accessibilityLabel={`Reduce ${item.name}`}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepQty}>{qty}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleIncrement(item.id)}
                  accessibilityLabel={`Increase ${item.name}`}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.bulkBtnWide}
            onPress={() => handleBulkAdd(item)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${BULK_STEP} ${unit} of ${item.name}`}
          >
            <Text style={styles.bulkBtnText}>＋ Add {BULK_STEP} {unit} quickly</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Hero header */}
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroHello}>Namaste 🙏</Text>
            <Text style={styles.shopName}>{appConfig.shopName}</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>🚚 Same-day</Text>
          </View>
        </View>
        <Text style={styles.tagline}>{appConfig.tagline}</Text>
      </View>

      {/* Grain grid with rich header */}
      <FlatList
        data={visibleGrains}
        keyExtractor={item => item.id}
        renderItem={renderGrain}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Featured hero card */}
            <View style={styles.featuredCard}>
              <Image
                source={{ uri: appConfig.hero.image }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.featuredOverlay} />
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>{appConfig.hero.badge}</Text>
                </View>
                <Text style={styles.featuredTitle}>{appConfig.hero.title}</Text>
                <Text style={styles.featuredSubtitle}>{appConfig.hero.subtitle}</Text>
              </View>
            </View>

            {/* Info banner pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bannerStrip}
            >
              {appConfig.banners.map((b, idx) => (
                <View key={idx} style={styles.bannerPill}>
                  <Text style={styles.bannerPillEmoji}>{b.emoji}</Text>
                  <Text style={styles.bannerPillText} numberOfLines={1}>
                    {b.title}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipStrip}
            >
              {appConfig.categories.map(cat => {
                const active = activeCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      tapFeedback();
                      setActiveCategory(cat.key);
                    }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {cat.emoji} {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {activeCategory === 'all'
                  ? 'All grains & attas'
                  : appConfig.categories.find(c => c.key === activeCategory)?.label}
              </Text>
              <Text style={styles.sectionCount}>{visibleGrains.length} items</Text>
            </View>
          </View>
        }
      />

      {/* Bottom cart bar */}
      {cartCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.cartBar}
          onPress={() => {
            tapFeedback();
            setFormVisible(true);
          }}
        >
          <View style={styles.cartBarLeft}>
            <View style={styles.cartIconWrap}>
              <Text style={styles.cartIcon}>🛒</Text>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountBadgeText}>{cartCount}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.cartBarCount}>{money(cartTotal)}</Text>
              <Text style={styles.cartBarHint}>
                {deliveryCharge > 0
                  ? `${cartCount} kg · incl. ${money(deliveryCharge)} delivery`
                  : `${cartCount} kg · free delivery 🎉`}
              </Text>
            </View>
          </View>
          <View style={styles.cartBarCta}>
            <Text style={styles.cartBarCtaText}>Place Order →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Order form */}
      <Modal
        visible={formVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFormVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => !submitting && setFormVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Delivery details</Text>

              {/* Order summary */}
              <View style={styles.summaryBox}>
                {cartItems.map(i => (
                  <View key={i.id} style={styles.summaryRow}>
                    <Text style={styles.summaryName} numberOfLines={1}>
                      {i.name} — {i.quantity} kg
                    </Text>
                    <Text style={styles.summaryPrice}>{money(i.price * i.quantity)}</Text>
                  </View>
                ))}
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summarySubLabel}>Subtotal</Text>
                  <Text style={styles.summarySubValue}>{money(subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summarySubLabel}>Delivery charge</Text>
                  <Text style={styles.summarySubValue}>
                    {deliveryCharge > 0 ? money(deliveryCharge) : 'FREE'}
                  </Text>
                </View>
                {amountToFreeDelivery > 0 ? (
                  <Text style={styles.freeDeliveryHint}>
                    Add {money(amountToFreeDelivery)} more for free delivery 🚚
                  </Text>
                ) : null}
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>{money(cartTotal)}</Text>
                </View>
              </View>

              {/* Address */}
              <Text style={styles.label}>Delivery address</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.address ? styles.inputError : null]}
                placeholder="House no, street, area, city"
                placeholderTextColor={C.textMuted}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

              {/* Pincode */}
              <Text style={styles.label}>Pincode *</Text>
              <TextInput
                style={[styles.input, errors.pincode ? styles.inputError : null]}
                placeholder="6-digit pincode"
                placeholderTextColor={C.textMuted}
                value={pincode}
                onChangeText={t => setPincode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
              {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}

              {/* Mobile */}
              <Text style={styles.label}>Mobile number *</Text>
              <View style={[styles.phoneRow, errors.mobile ? styles.inputError : null]}>
                <Text style={styles.phonePrefix}>{appConfig.phoneCountryCode}</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder={`${appConfig.phoneLocalDigits}-digit number`}
                  placeholderTextColor={C.textMuted}
                  value={mobile}
                  onChangeText={t =>
                    setMobile(t.replace(/[^0-9]/g, '').slice(0, appConfig.phoneLocalDigits))
                  }
                  keyboardType="phone-pad"
                  maxLength={appConfig.phoneLocalDigits}
                />
              </View>
              {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                onPress={handlePlaceOrder}
                disabled={submitting}
                accessibilityRole="button"
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Place Order • {money(cartTotal)}</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.finePrint}>
                Cash on delivery. We'll call to confirm before dispatch.
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },

  // ---- Hero header ----
  hero: {
    paddingHorizontal: appConfig.layout.spacing,
    paddingTop: 6,
    paddingBottom: 16,
    backgroundColor: C.heroTint,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroHello: { fontSize: 13, color: C.textMuted, fontWeight: '600' },
  shopName: { fontSize: 26, fontWeight: '900', color: C.primary, letterSpacing: 0.3 },
  heroPill: {
    backgroundColor: C.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroPillText: { color: C.primaryDark, fontWeight: '800', fontSize: 12 },
  tagline: { fontSize: 13, color: C.textMuted, marginTop: 6 },

  listContent: {
    padding: appConfig.layout.spacing,
    paddingBottom: 130,
  },
  row: { gap: 14 },

  // ---- Featured hero card ----
  featuredCard: {
    height: 168,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: C.primaryDark,
  },
  featuredImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60,29,12,0.45)',
  },
  featuredContent: { flex: 1, padding: 18, justifyContent: 'flex-end' },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  featuredBadgeText: { color: C.primaryDark, fontWeight: '800', fontSize: 11 },
  featuredTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', lineHeight: 27 },
  featuredSubtitle: { color: 'rgba(255,255,255,0.92)', fontSize: 12.5, marginTop: 4, fontWeight: '600' },

  // ---- Info banner pills ----
  bannerStrip: { gap: 8, paddingVertical: 2, paddingRight: 4 },
  bannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  bannerPillEmoji: { fontSize: 15 },
  bannerPillText: { fontSize: 12, fontWeight: '700', color: C.text },

  // ---- Category chips ----
  chipStrip: { gap: 8, paddingVertical: 2, paddingRight: 4, marginTop: 14 },
  chip: {
    backgroundColor: C.surface,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: C.text },
  chipTextActive: { color: '#FFFFFF' },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: C.text },
  sectionCount: { fontSize: 12, color: C.textMuted, fontWeight: '600' },

  // ---- Product card ----
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#3C1D0C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardActive: { borderColor: C.primary, borderWidth: 1.5 },
  cardImage: { width: '100%', height: 120, backgroundColor: '#EFE7DB' },
  imageScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  vegMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: C.success,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.success },
  stateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  stateBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  inCartTick: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: C.success,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  inCartTickText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  cardBody: { padding: 11 },
  cardName: { fontSize: 14, fontWeight: '800', color: C.text },
  cardNameHindi: { fontSize: 13, fontWeight: '700', color: C.primary, marginTop: 1 },
  cardSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 3, minHeight: 15 },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardPrice: { fontSize: 18, fontWeight: '900', color: C.text },
  cardPricePerUnit: { fontSize: 11, fontWeight: '600', color: C.textMuted, marginTop: -1 },

  addBtn: {
    backgroundColor: C.primary,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 0.6 },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    borderRadius: 10,
  },
  stepBtn: { paddingHorizontal: 11, paddingVertical: 5 },
  stepBtnText: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  stepQty: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', minWidth: 22, textAlign: 'center' },

  bulkBtnWide: {
    marginTop: 9,
    backgroundColor: C.accentSoft,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bulkBtnText: { color: C.primaryDark, fontWeight: '800', fontSize: 12 },

  // ---- Bottom cart bar ----
  cartBar: {
    position: 'absolute',
    left: appConfig.layout.spacing,
    right: appConfig.layout.spacing,
    bottom: 24,
    backgroundColor: C.cartBar,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: { fontSize: 20 },
  cartCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartCountBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  cartBarCount: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  cartBarHint: { color: 'rgba(255,255,255,0.82)', fontSize: 11, marginTop: 1 },
  cartBarCta: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cartBarCtaText: { color: C.primaryDark, fontWeight: '900', fontSize: 13 },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: C.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '88%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 14 },

  summaryBox: {
    backgroundColor: C.surface,
    borderRadius: appConfig.layout.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 18,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  summaryName: { flex: 1, fontSize: 13, color: C.text, marginRight: 10 },
  summaryPrice: { fontSize: 13, fontWeight: '700', color: C.text },
  summaryDivider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  summarySubLabel: { fontSize: 13, color: C.textMuted },
  summarySubValue: { fontSize: 13, fontWeight: '700', color: C.text },
  freeDeliveryHint: { fontSize: 11, color: C.success, fontWeight: '700', marginTop: 4 },
  summaryTotalLabel: { fontSize: 15, fontWeight: '800', color: C.text },
  summaryTotalValue: { fontSize: 16, fontWeight: '800', color: C.primary },

  label: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: C.surface,
    borderRadius: appConfig.layout.radius,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    marginBottom: 4,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  inputError: { borderColor: C.danger },
  errorText: { color: C.danger, fontSize: 12, marginBottom: 8, marginTop: 2 },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: appConfig.layout.radius,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
  },
  phonePrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingVertical: 12,
  },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text },

  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: appConfig.layout.cardRadius,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  finePrint: { fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 12 },
});
