import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Product, User } from '../types';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import { fetchProducts, fetchUsers } from '../utils/api';
import { getUserName } from '../utils/storage';
import Header from '../components/Header';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const StatCard = ({ title, value, subtitle, icon, colors }: StatCardProps & { colors: any }) => (
  <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.statHeader}>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
  </View>
);

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const [userName, setUserName] = useState<string>('Admin');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    const name = await getUserName();
    if (name) setUserName(name);
  };

  const loadDashboardData = async () => {
    try {
      const [productsData, usersData] = await Promise.all([
        fetchProducts(),
        fetchUsers(),
      ]);
      setProducts(productsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const calculateStats = () => {
    const totalBids = products.reduce((acc, p) => acc + (p.lowestBid ? 1 : 0), 0);
    const totalUsers = users.length;
    const totalValue = products.reduce((acc, p) => acc + p.lowestBid, 0);
    
    const now = new Date();
    const activeAuctions = products.filter(p => new Date(p.endTime) > now).length;
    const finishedAuctions = products.length - activeAuctions;

    return {
      totalValue: totalValue.toFixed(2),
      totalBids,
      totalUsers,
      activeAuctions,
      finishedAuctions,
      totalProducts: products.length,
    };
  };

  const stats = calculateStats();

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.welcomeText, { color: colors.text }]}>
        Welcome Back, {userName}!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <Header />
        <View style={commonStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue}`}
            subtitle="Total value of lowest bids"
            icon="cash-outline"
            colors={colors}
          />
          <StatCard
            title="Total Bids"
            value={`+${stats.totalBids}`}
            subtitle="Across all products"
            icon="hammer-outline"
            colors={colors}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            subtitle="Number of registered users"
            icon="people-outline"
            colors={colors}
          />
          <StatCard
            title="Auctions"
            value={stats.totalProducts.toString()}
            subtitle={`${stats.activeAuctions} active, ${stats.finishedAuctions} finished`}
            icon="list-outline"
            colors={colors}
          />
        </View>

        <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>Recent Activity</Text>
          </View>
          <Text style={[styles.activityText, { color: colors.textMuted }]}>
            No recent activity to show. Bidding activity will appear here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.regular,
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  activityHeader: {
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  activityText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    marginTop: 16,
  },
});
