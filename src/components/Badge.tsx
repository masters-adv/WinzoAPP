import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { typography } from '../styles/typography';
import { useTheme } from '../contexts/ThemeContext';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({ text, variant = 'default', size = 'medium' }: BadgeProps) {
  const { colors } = useTheme();
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.success,
          color: colors.text,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          color: colors.text,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          color: colors.buttonText,
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          color: colors.text,
        };
      default:
        return {
          backgroundColor: colors.surface,
          color: colors.text,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          fontSize: typography.sizes.xs,
        };
      case 'large':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: typography.sizes.base,
        };
      default:
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          fontSize: typography.sizes.sm,
        };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyle.backgroundColor },
        {
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantStyle.color, fontSize: sizeStyle.fontSize },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
    opacity: 0.9,
  },
  text: {
    fontFamily: typography.fonts.bold,
    textAlign: 'center',
    fontWeight: typography.weights.bold,
  },
});
