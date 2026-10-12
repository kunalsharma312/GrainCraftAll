import { Platform } from 'react-native';
import themeConfig from './assets/theme.json';

const fontWeight = {
  regular: '400',
  medium: '600',
  bold: '700',
} as const;

const theme = {
  ...themeConfig,
  typography: {
    ...themeConfig.typography,
    fontFamily: Platform.select(themeConfig.typography.fontFamily) ?? 'System',
    fontWeight,
  },
};

export default theme;
