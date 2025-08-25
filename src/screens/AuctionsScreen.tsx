import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Product } from '../types';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import { fetchProducts } from '../utils/api';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

export default function AuctionsScreen() {
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard 
      product={item} 
      onPress={() => {
        // TODO: Navigate to product detail or bid screen
        console.log('Bid on product:', item.name);
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.pageTitle, { color: colors.primary }]}>Live Auctions</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <Header />
        <View style={commonStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading auctions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Header />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    marginTop: 16,
  },
});
