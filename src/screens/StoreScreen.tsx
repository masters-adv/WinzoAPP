import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

export default function StoreScreen() {
  const { colors } = useTheme();
  
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.pageTitle, { color: colors.primary }]}>Store</Text>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <Header />
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.comingSoonContainer}>
          <View style={[styles.comingSoonCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Coming Soon</Text>
            <Text style={[styles.comingSoonDescription, { color: colors.textSecondary }]}>
              The WinZO store is under development. Here you'll be able to purchase coins and exclusive items.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: typography.sizes['4xl'],
    fontFamily: typography.fonts.oleoBold,
    textAlign: 'center',
    fontWeight: typography.weights.bold,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  comingSoonCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  comingSoonTitle: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});
