import { Text as NativeText, type TextProps } from 'react-native';
import theme from '../theme';

export default function ThemedText({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[{ fontFamily: theme.typography.fontFamily }, style]} />;
}
