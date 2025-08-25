import { Platform } from 'react-native';

export const typography = {
  // Font families
  fonts: {
    regular: Platform.OS === 'ios' ? 'Roboto-Regular' : 'Roboto-Regular',
    medium: Platform.OS === 'ios' ? 'Roboto-Medium' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'Roboto-Bold' : 'Roboto-Bold',
    oleo: Platform.OS === 'ios' ? 'OleoScript-Regular' : 'OleoScript-Regular',
    oleoBold: Platform.OS === 'ios' ? 'OleoScript-Bold' : 'OleoScript-Bold',
  },
  
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights
  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
    '4xl': 48,
    '5xl': 60,
  },
  
  // Font weights
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

