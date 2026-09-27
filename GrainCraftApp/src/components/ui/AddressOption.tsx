import { StyleSheet, TouchableOpacity } from 'react-native';
import type { Address } from '../../redux/types';
import theme from '../../theme';
import Text from '../ThemedText';

interface AddressOptionProps {
  address: Address;
  selected: boolean;
  onSelect: (address: Address) => void;
}

export default function AddressOption({ address, selected, onSelect }: AddressOptionProps) {
  return (
    <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.container, selected && styles.selected]} onPress={() => onSelect(address)}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>📍 {address.address}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: theme.components.badge.borderRadius, marginBottom: 6, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong },
  selected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  label: { color: theme.colors.detail, fontSize: theme.typography.fontSize.small },
  selectedLabel: { color: theme.colors.textContrast },
});
