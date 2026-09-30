import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import theme from '../../theme';
import Text from '../ThemedText';

interface TextFieldProps extends TextInputProps {
  label: string;
}

export default function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps} style={[styles.input, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textMuted, marginBottom: 6 },
  input: { backgroundColor: theme.colors.surface, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong, borderRadius: theme.components.input.borderRadius, padding: 12, color: theme.colors.text },
});
