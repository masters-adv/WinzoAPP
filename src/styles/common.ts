import { StyleSheet } from 'react-native';
import { typography } from './typography';

// Create a function that generates common styles based on colors
export const createCommonStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  padding: {
    padding: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  paddingVertical: {
    paddingVertical: 16,
  },
  
  margin: {
    margin: 16,
  },
  
  marginHorizontal: {
    marginHorizontal: 16,
  },
  
  marginVertical: {
    marginVertical: 16,
  },
  
  // Text styles
  title: {
    fontSize: typography.sizes['4xl'],
    fontFamily: typography.fonts.bold,
    color: colors.text,
    textAlign: 'center',
  },
  
  headlineGradient: {
    fontSize: typography.sizes['4xl'],
    fontFamily: typography.fonts.oleo,
    color: colors.primary,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  body: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    color: colors.text,
  },
  
  bodySecondary: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    color: colors.textSecondary,
  },
  
  caption: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    color: colors.buttonText,
  },
  
  secondaryButton: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.medium,
    color: colors.text,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    color: colors.text,
  },
  
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text,
    marginBottom: 8,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Shadow styles
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

// Export a default style object for backward compatibility (using dark theme colors)
export const commonStyles = createCommonStyles({
  background: '#000000',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#999999',
  primary: '#FFD700',
  buttonText: '#000000',
  buttonSecondary: '#333333',
  border: '#333333',
});
