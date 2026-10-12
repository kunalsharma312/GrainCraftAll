import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../theme';
import Text from '../ThemedText';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <TouchableOpacity key={option.value} accessibilityRole="tab" accessibilityState={{ selected }} style={[styles.option, selected && styles.selected]} onPress={() => onChange(option.value)}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: theme.colors.border, borderRadius: theme.components.button.borderRadius, padding: 3, marginBottom: 20 },
  option: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  selected: { backgroundColor: theme.colors.surfaceWarm, shadowOpacity: 0.1, shadowRadius: 2 },
  label: { fontSize: theme.typography.fontSize.bodySmall, color: theme.colors.textSecondary, fontWeight: theme.typography.fontWeight.medium },
  selectedLabel: { color: theme.colors.text },
});
