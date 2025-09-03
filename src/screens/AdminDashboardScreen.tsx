import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { Product, User, CoinTransaction } from '../types';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import { fetchProducts, fetchUsers, fetchAllTransactions } from '../utils/api';
import { getUserName, getTransactionHistory } from '../utils/storage';
import Header from '../components/Header';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: any;
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

const ActionCard = ({ title, description, icon, onPress, colors }: ActionCardProps) => (
  <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
    <View style={styles.actionHeader}>
      <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </View>
    <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.actionDescription, { color: colors.textMuted }]}>{description}</Text>
  </TouchableOpacity>
);

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [userName, setUserName] = useState<string>('Admin');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newCoins, setNewCoins] = useState('');

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
      const [productsData, usersData, transactionsData] = await Promise.all([
        fetchProducts(),
        fetchUsers(),
        getTransactionHistory(),
      ]);
      setProducts(productsData);
      setUsers(usersData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserManagement = () => {
    setShowUserModal(true);
  };

  const handleTransactionView = () => {
    setShowTransactionModal(true);
  };

  const handleProductManagement = () => {
    navigation.navigate('AdminProducts' as never);
  };

  const handleStoreManagement = () => {
    navigation.navigate('AdminStore' as never);
  };

  const handlePaymentManagement = () => {
    navigation.navigate('AdminPayments' as never);
  };

  const handleGrantCoins = async () => {
    if (!selectedUser || !newCoins) {
      Alert.alert('Error', 'Please select a user and enter coin amount');
      return;
    }

    try {
      // Here you would call an API to grant coins
      Alert.alert('Success', `Granted ${newCoins} coins to ${selectedUser.name}`);
      setNewCoins('');
      setSelectedUser(null);
      setShowUserModal(false);
      await loadDashboardData();
    } catch (error) {
      Alert.alert('Error', 'Failed to grant coins');
    }
  };

  const handleSystemSettings = () => {
    Alert.alert(
      'System Settings',
      'Choose an action:',
      [
        { text: 'Clear Cache', onPress: () => Alert.alert('Cache cleared') },
        { text: 'Reset Database', onPress: () => Alert.alert('Database reset') },
        { text: 'Export Data', onPress: () => Alert.alert('Data exported') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
    const totalCoins = users.reduce((acc, u) => acc + u.coins, 0);
    const totalTransactions = transactions.length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
    
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
      totalCoins,
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      totalRevenue: totalRevenue.toFixed(2),
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

        {/* Enhanced Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue}`}
            subtitle="From completed transactions"
            icon="cash-outline"
            colors={colors}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            subtitle={`${stats.totalCoins} total coins`}
            icon="people-outline"
            colors={colors}
          />
          <StatCard
            title="Transactions"
            value={stats.totalTransactions.toString()}
            subtitle={`${stats.pendingTransactions} pending`}
            icon="card-outline"
            colors={colors}
          />
          <StatCard
            title="Auctions"
            value={stats.totalProducts.toString()}
            subtitle={`${stats.activeAuctions} active`}
            icon="hammer-outline"
            colors={colors}
          />
        </View>

        {/* Admin Action Cards */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin Controls</Text>
        <View style={styles.actionGrid}>
          <ActionCard
            title="User Management"
            description="Manage users, grant coins, view profiles"
            icon="people"
            onPress={handleUserManagement}
            colors={colors}
          />
          <ActionCard
            title="Product Management"
            description="Add, edit, delete auction products"
            icon="cube"
            onPress={handleProductManagement}
            colors={colors}
          />
          <ActionCard
            title="Store Management"
            description="Manage coin packages and pricing"
            icon="storefront"
            onPress={handleStoreManagement}
            colors={colors}
          />
          <ActionCard
            title="Payment Management"
            description="Review transactions and payments"
            icon="card"
            onPress={handlePaymentManagement}
            colors={colors}
          />
          <ActionCard
            title="Transaction History"
            description="View all system transactions"
            icon="receipt"
            onPress={handleTransactionView}
            colors={colors}
          />
          <ActionCard
            title="System Settings"
            description="Database, cache, and system controls"
            icon="settings"
            onPress={handleSystemSettings}
            colors={colors}
          />
        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {transactions.slice(0, 5).map((transaction, index) => (
            <View key={transaction.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons 
                  name={transaction.status === 'completed' ? 'checkmark-circle' : 'time'} 
                  size={16} 
                  color={transaction.status === 'completed' ? colors.success : colors.warning} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  {transaction.paymentMethod === 'bid_placement' ? 'Bid placed' : 'Coin purchase'}
                </Text>
                <Text style={[styles.activitySubtext, { color: colors.textMuted }]}>
                  {transaction.adminNotes || `${transaction.coins} coins - ${transaction.status}`}
                </Text>
              </View>
              <Text style={[styles.activityAmount, { color: colors.textMuted }]}>
                ${Math.abs(transaction.amount)}
              </Text>
            </View>
          ))}
          {transactions.length === 0 && (
            <Text style={[styles.activityText, { color: colors.textMuted }]}>
              No recent activity to show.
            </Text>
          )}
        </View>

        {/* User Management Modal */}
        <Modal visible={showUserModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>User Management</Text>
                <TouchableOpacity onPress={() => setShowUserModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.userItem, { backgroundColor: colors.card }]}
                    onPress={() => setSelectedUser(item)}
                  >
                    <View>
                      <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.userEmail, { color: colors.textMuted }]}>{item.email}</Text>
                    </View>
                    <Text style={[styles.userCoins, { color: colors.primary }]}>{item.coins} coins</Text>
                  </TouchableOpacity>
                )}
                style={styles.userList}
              />
              
              {selectedUser && (
                <View style={styles.grantCoinsSection}>
                  <Text style={[styles.selectedUserText, { color: colors.text }]}>Grant coins to {selectedUser.name}</Text>
                  <TextInput
                    style={[styles.coinsInput, { backgroundColor: colors.card, color: colors.text }]}
                    placeholder="Enter coin amount"
                    placeholderTextColor={colors.textMuted}
                    value={newCoins}
                    onChangeText={setNewCoins}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={[styles.grantButton, { backgroundColor: colors.primary }]} onPress={handleGrantCoins}>
                    <Text style={styles.grantButtonText}>Grant Coins</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Transaction Modal */}
        <Modal visible={showTransactionModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Transaction History</Text>
                <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.transactionItem, { backgroundColor: colors.card }]}>
                    <View style={styles.transactionHeader}>
                      <Text style={[styles.transactionId, { color: colors.text }]}>#{item.id.slice(-8)}</Text>
                      <Text style={[styles.transactionStatus, { 
                        color: item.status === 'completed' ? colors.success : 
                               item.status === 'pending' ? colors.warning : colors.error 
                      }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.transactionMethod, { color: colors.textMuted }]}>{item.paymentMethod}</Text>
                    <Text style={[styles.transactionAmount, { color: colors.text }]}>
                      ${item.amount} - {item.coins} coins
                    </Text>
                    {item.adminNotes && (
                      <Text style={[styles.transactionNotes, { color: colors.textMuted }]}>{item.adminNotes}</Text>
                    )}
                  </View>
                )}
                style={styles.transactionList}
              />
            </View>
          </View>
        </Modal>
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
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    marginBottom: 16,
    marginTop: 24,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    borderWidth: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    lineHeight: 18,
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.medium,
    marginBottom: 2,
  },
  activitySubtext: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
  },
  activityAmount: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  userList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
  },
  userCoins: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
  },
  grantCoinsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 20,
  },
  selectedUserText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.medium,
    marginBottom: 12,
  },
  coinsInput: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: typography.sizes.base,
  },
  grantButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  grantButtonText: {
    color: 'white',
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
  },
  transactionList: {
    maxHeight: 400,
  },
  transactionItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
  },
  transactionStatus: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bold,
  },
  transactionMethod: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    marginBottom: 4,
  },
  transactionNotes: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    marginTop: 16,
  },
});
