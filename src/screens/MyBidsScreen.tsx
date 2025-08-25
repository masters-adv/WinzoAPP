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

import { Bid, Product } from '../types';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import { fetchProducts, getMockBids } from '../utils/api';
import { getUserId } from '../utils/storage';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

export default function MyBidsScreen() {
  const { colors } = useTheme();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      const userId = await getUserId();
      const products = await fetchProducts();
      const userBids = getMockBids(products, userId || 0);
      setBids(userBids);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBids();
    setRefreshing(false);
  };

  const renderBid = ({ item }: { item: Bid }) => (
    <ProductCard 
      product={item} 
      onPress={() => {
        // TODO: Navigate to product detail or update bid
        console.log('Update bid for:', item.name);
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.pageTitle, { color: colors.primary }]}>My Bids</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bids Yet</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          You haven't placed any bids. Head over to the auctions to get started!
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <Header />
        <View style={commonStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your bids...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Header />
      {bids.length > 0 ? (
        <FlatList
          data={bids}
          renderItem={renderBid}
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
      ) : (
        <View style={styles.container}>
          {renderHeader()}
          {renderEmptyState()}
        </View>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});
