import { ScrollView, StyleSheet, View } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import theme from '../theme';
import Text from '../components/ThemedText';

export default function OrdersScreen() {
  const orders = useAppSelector(state => state.cart.orders);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Orders & Dispatches</Text>

      {orders.map(order => (
        <View key={order.id} style={styles.card}>
          <View style={styles.orderHeading}>
            <Text style={styles.orderDate}>{order.id} • {order.date}</Text>
            <Text style={styles.orderStatus}>{order.status}</Text>
          </View>
          <Text style={styles.orderTitle}>{order.title}</Text>
          <View style={styles.millBox}>
            <Text style={styles.millInfo}>⚙️ {order.millInfo}</Text>
          </View>
          <Text style={styles.delivery}>🚚 Delivery: {order.delivery}</Text>
        </View>
      ))}

      {orders.length === 0 && <Text style={styles.emptyText}>No active milling runs found.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: theme.colors.background, paddingBottom: 30 },
  title: { fontSize: theme.typography.fontSize.headingLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 15 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.components.card.borderRadius, padding: 15, marginBottom: 12, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border },
  orderHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderDate: { fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.text },
  orderStatus: { color: theme.colors.primary, fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.small },
  orderTitle: { fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text, marginBottom: 6 },
  millBox: { backgroundColor: theme.colors.surfaceWarm, padding: 8, borderRadius: theme.components.badge.borderRadius, marginTop: 4 },
  millInfo: { fontSize: theme.typography.fontSize.label, color: theme.colors.detail },
  delivery: { fontSize: theme.typography.fontSize.label, color: theme.colors.textSecondary, marginTop: 8 },
  emptyText: { textAlign: 'center', color: theme.colors.textSubtle, marginTop: 40 },
});
