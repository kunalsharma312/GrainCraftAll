import { useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchOrders } from '../redux/slices/orderSlice';
import theme from '../theme';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import SectionHeading from '../components/ui/SectionHeading';
import { LoadingSpinner, ErrorMessage } from '../components/ui/LoadingSpinner';
import { EmptyStateFallback } from '../components/ui/EmptyStateFallback';
import { AnimatedComponent } from '../components/ui/AnimatedComponent';
import { MaterialIcons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector(state => state.orders);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrders());
    }, [dispatch])
  );

  const handleRetry = () => {
    dispatch(fetchOrders());
  };

  if (loading && orders.length === 0) {
    return (
      <AppScreen>
        <LoadingSpinner message="Loading your orders..." fullScreen />
      </AppScreen>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#4CAF50';
      case 'processing':
        return '#FFA726';
      case 'shipped':
        return '#29B6F6';
      case 'pending':
        return '#9C27B0';
      case 'cancelled':
        return '#EF5350';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'check-circle';
      case 'processing':
        return 'schedule';
      case 'shipped':
        return 'local-shipping';
      case 'pending':
        return 'schedule';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  return (
    <AppScreen style={{ flex: 1, padding: 0 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <AnimatedComponent type="slideInDown" duration={400}>
          <SectionHeading title="Orders & Dispatches" />
        </AnimatedComponent>

        {error && (
          <AnimatedComponent type="slideInDown" duration={300}>
            <ErrorMessage message={error} onRetry={handleRetry} />
          </AnimatedComponent>
        )}

        {orders.length === 0 && !error ? (
          <EmptyStateFallback
            icon="shopping-cart"
            title="No Orders Yet"
            message="Start by browsing the grain vault and placing your first order"
          />
        ) : (
          <>
            {orders.map((order, index) => (
              <AnimatedComponent
                key={order.id}
                type="slideInUp"
                delay={100 + index * 50}
                duration={400}
              >
                <AppCard style={styles.card}>
                  <View style={styles.orderHeading}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderDate}>{order.date}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(order.status) + '20' },
                      ]}
                    >
                      <MaterialIcons
                        name={getStatusIcon(order.status) as any}
                        size={14}
                        color={getStatusColor(order.status)}
                      />
                      <Text
                        style={[
                          styles.orderStatus,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.orderTitle}>{order.title}</Text>

                  <View style={styles.millBox}>
                    <MaterialIcons name="engineering" size={16} color={theme.colors.primary} />
                    <Text style={styles.millInfo}>{order.millInfo}</Text>
                  </View>

                  <View style={styles.deliveryBox}>
                    <MaterialIcons name="local-shipping" size={16} color="#29B6F6" />
                    <Text style={styles.delivery}>Delivery: {order.delivery}</Text>
                  </View>

                  {order.estimatedDelivery && (
                    <View style={styles.estimatedBox}>
                      <MaterialIcons name="calendar-today" size={16} color="#FFA726" />
                      <Text style={styles.estimated}>Est. Delivery: {order.estimatedDelivery}</Text>
                    </View>
                  )}

                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
                  </View>
                </AppCard>
              </AnimatedComponent>
            ))}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  orderHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderInfo: { flex: 1 },
  orderId: {
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.bodyLarge,
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderStatus: {
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.small,
  },
  orderTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 12,
  },
  millBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.colors.surfaceWarm,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  millInfo: {
    fontSize: theme.typography.fontSize.label,
    color: theme.colors.detail,
    flex: 1,
  },
  deliveryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  delivery: {
    fontSize: theme.typography.fontSize.label,
    color: '#1976D2',
    flex: 1,
  },
  estimatedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  estimated: {
    fontSize: theme.typography.fontSize.label,
    color: '#F57C00',
    flex: 1,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
});
