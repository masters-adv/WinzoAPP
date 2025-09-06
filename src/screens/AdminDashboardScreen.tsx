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
import { getUserName, getTransactionHistory, clearUserData } from '../utils/storage';
import { UserService, TransactionService, SettingsService } from '../services/database';
import { MockDatabase } from '../config/database';
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
  const [showUserActions, setShowUserActions] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({ name: '', email: '' });

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

    const coinsToGrant = parseInt(newCoins);
    if (isNaN(coinsToGrant) || coinsToGrant <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    try {
      await UserService.grantCoinsToUser(selectedUser.id, coinsToGrant);
      Alert.alert('Success', `Successfully granted ${coinsToGrant} coins to ${selectedUser.name}`);
      setNewCoins('');
      setSelectedUser(null);
      setShowUserActions(false);
      setShowUserModal(false);
      await loadDashboardData();
    } catch (error) {
      console.error('Error granting coins:', error);
      Alert.alert('Error', 'Failed to grant coins. Please try again.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const users = await MockDatabase.getUsers();
              const updatedUsers = users.filter(u => u.id !== user.id);
              await MockDatabase.saveUsers(updatedUsers);
              Alert.alert('Success', `User ${user.name} deleted successfully`);
              await loadDashboardData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const handleUpdateUserRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Update User Role',
      `Change ${user.name}'s role from ${user.role} to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              const users = await MockDatabase.getUsers();
              const userIndex = users.findIndex(u => u.id === user.id);
              if (userIndex !== -1) {
                users[userIndex].role = newRole as 'admin' | 'user';
                await MockDatabase.saveUsers(users);
                Alert.alert('Success', `User role updated to ${newRole}`);
                await loadDashboardData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update user role');
            }
          }
        }
      ]
    );
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserData({ name: user.name, email: user.email });
    setShowEditModal(true);
  };

  const handleSaveEditUser = async () => {
    if (!editingUser || !editUserData.name || !editUserData.email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const users = await MockDatabase.getUsers();
      const userIndex = users.findIndex(u => u.id === editingUser.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name: editUserData.name, email: editUserData.email };
        await MockDatabase.saveUsers(users);
        Alert.alert('Success', 'User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
        setEditUserData({ name: '', email: '' });
        await loadDashboardData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleBanUser = async (user: User) => {
    const isBanned = (user as any).banned || false;
    const action = isBanned ? 'unban' : 'ban';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: isBanned ? 'default' : 'destructive',
          onPress: async () => {
            try {
              const users = await MockDatabase.getUsers();
              const userIndex = users.findIndex(u => u.id === user.id);
              if (userIndex !== -1) {
                (users[userIndex] as any).banned = !isBanned;
                await MockDatabase.saveUsers(users);
                Alert.alert('Success', `User ${isBanned ? 'unbanned' : 'banned'} successfully`);
                await loadDashboardData();
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} user`);
            }
          }
        }
      ]
    );
  };

  const handleGrantCoinsToUser = (user: User) => {
    setSelectedUser(user);
    setShowUserActions(true);
  };

  const handleClearCache = async () => {
    try {
      await clearUserData();
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const handleResetDatabase = async () => {
    Alert.alert(
      'Reset Database',
      'This will delete all data and reset to default. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await MockDatabase.clearAll();
              Alert.alert('Success', 'Database reset successfully');
              await loadDashboardData();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset database');
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const users = await MockDatabase.getUsers();
      const products = await MockDatabase.getProducts();
      const transactions = await MockDatabase.getTransactions();
      
      const exportData = {
        users: users.length,
        products: products.length,
        transactions: transactions.length,
        exportDate: new Date().toISOString()
      };
      
      Alert.alert(
        'Data Export',
        `Export Summary:\n• Users: ${exportData.users}\n• Products: ${exportData.products}\n• Transactions: ${exportData.transactions}\n• Date: ${new Date().toLocaleDateString()}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleSystemSettings = () => {
    Alert.alert(
      'System Settings',
      'Choose an action:',
      [
        { text: 'Clear Cache', onPress: handleClearCache },
        { text: 'Reset Database', onPress: handleResetDatabase },
        { text: 'Export Data', onPress: handleExportData },
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
                <TouchableOpacity onPress={() => {
                   setShowUserModal(false);
                   setSelectedUser(null);
                   setShowUserActions(false);
                   setNewCoins('');
                 }}>
                   <Ionicons name="close" size={24} color={colors.textMuted} />
                 </TouchableOpacity>
              </View>
              
              <FlatList
                  data={users}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const isBanned = (item as any).banned || false;
                    return (
                      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.userInfo}>
                          <View style={styles.userDetails}>
                            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{item.email}</Text>
                            <View style={styles.userMetaInfo}>
                              <Text style={[styles.userCoins, { color: colors.primary }]}>{item.coins} coins</Text>
                              <Text style={[styles.userRole, { 
                                color: item.role === 'admin' ? colors.warning : colors.success 
                              }]}>{item.role.toUpperCase()}</Text>
                              {isBanned && (
                                <Text style={[styles.bannedStatus, { color: colors.error }]}>BANNED</Text>
                              )}
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.userActions}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primary + '20' }]}
                            onPress={() => handleEditUser(item)}
                          >
                            <Ionicons name="create-outline" size={18} color={colors.primary} />
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.coinsButton, { backgroundColor: colors.success + '20' }]}
                            onPress={() => handleGrantCoinsToUser(item)}
                          >
                            <Ionicons name="diamond-outline" size={18} color={colors.success} />
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.banButton, { 
                              backgroundColor: isBanned ? colors.warning + '20' : colors.error + '20' 
                            }]}
                            onPress={() => handleBanUser(item)}
                          >
                            <Ionicons 
                              name={isBanned ? "checkmark-circle-outline" : "ban-outline"} 
                              size={18} 
                              color={isBanned ? colors.warning : colors.error} 
                            />
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error + '20' }]}
                            onPress={() => handleDeleteUser(item)}
                          >
                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  style={styles.userList}
                />
              
              {selectedUser && showUserActions && (
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
                   <View style={styles.grantButtonsContainer}>
                     <TouchableOpacity 
                       style={[styles.grantButton, { backgroundColor: colors.primary }]} 
                       onPress={handleGrantCoins}
                     >
                       <Text style={styles.grantButtonText}>Grant Coins</Text>
                     </TouchableOpacity>
                     <TouchableOpacity 
                       style={[styles.cancelButton, { backgroundColor: colors.textMuted }]} 
                       onPress={() => {
                         setShowUserActions(false);
                         setSelectedUser(null);
                         setNewCoins('');
                       }}
                     >
                       <Text style={styles.cancelButtonText}>Cancel</Text>
                     </TouchableOpacity>
                   </View>
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

        {/* Edit User Modal */}
        <Modal visible={showEditModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit User</Text>
                <TouchableOpacity onPress={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setEditUserData({ name: '', email: '' });
                }}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.editForm}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editUserData.name}
                    onChangeText={(text) => setEditUserData({ ...editUserData, name: text })}
                    placeholder="Enter user name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editUserData.email}
                    onChangeText={(text) => setEditUserData({ ...editUserData, email: text })}
                    placeholder="Enter user email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                  />
                </View>
                
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: colors.primary }]} 
                    onPress={handleSaveEditUser}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.cancelEditButton, { backgroundColor: colors.textMuted }]} 
                    onPress={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setEditUserData({ name: '', email: '' });
                    }}
                  >
                    <Text style={styles.cancelEditButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  userStats: {
    alignItems: 'flex-end',
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
    marginBottom: 2,
  },
  userRole: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
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
  grantButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  grantButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  grantButtonText: {
    color: 'white',
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
  },
  cancelButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
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
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  userDetails: {
    flex: 1,
  },
  userMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  bannedStatus: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {},
  coinsButton: {},
  banButton: {},
  deleteButton: {},
  editForm: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: typography.sizes.base,
    borderWidth: 1,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
  },
  cancelEditButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  cancelEditButtonText: {
    color: 'white',
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
  },
});
