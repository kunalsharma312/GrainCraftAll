/**
 * Enhanced theme with professional colors, spacing, and shadows
 */

export const modernTheme = {
  colors: {
    // Primary
    primary: '#8B4513',
    primaryLight: '#D2691E',
    primaryDark: '#654321',
    
    // Secondary
    secondary: '#2E7D32',
    secondaryLight: '#66BB6A',
    
    // Backgrounds
    background: '#FDFBF7',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F3F0',
    surfaceWarm: '#FFF8E1',
    
    // Text
    text: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    textLight: '#FFFFFF',
    
    // Status colors
    success: '#4CAF50',
    successBright: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#29B6F6',
    
    // Borders
    border: '#E8E8E8',
    borderLight: '#F0F0F0',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  typography: {
    fontSize: {
      caption: 12,
      captionSmall: 10,
      small: 13,
      body: 14,
      bodyLarge: 16,
      bodySmall: 13,
      subtitle: 16,
      subtitleLarge: 18,
      headingSmall: 20,
      headingMedium: 24,
      headingLarge: 28,
      display: 32,
    },
    fontWeight: {
      light: '300' as const,
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },
  
  components: {
    button: {
      borderRadius: 12,
      height: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    card: {
      borderRadius: 16,
      padding: 16,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    input: {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      height: 48,
    },
    badge: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    xlarge: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 9999,
  },
} as const;

export type Theme = typeof modernTheme;
export default modernTheme;
