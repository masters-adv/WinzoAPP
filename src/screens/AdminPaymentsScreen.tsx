import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import { typography } from '../styles/typography';
import { useTheme } from '../contexts/ThemeContext';
import { CoinTransaction } from '../types';
import { 
  fetchPendingTransactions, 
  fetchAllTransactions, 
  verifyTransaction,
  updateVodafoneNumbers,
  fetchVodafoneNumbers 
} from '../utils/api';
import { getUserId } from '../utils/storage';
import Header from '../components/Header';

export default function AdminPaymentsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'settings'>('pending');
  const [pendingTransactions, setPendingTransactions] = useState<CoinTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<CoinTransaction[]>([]);
  const [vodafoneNumbers, setVodafoneNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CoinTransaction | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [newVodafoneNumber, setNewVodafoneNumber] = useState('');
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Create styles with theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      alignItems: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    autoRefreshIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    autoRefreshText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.robotoMedium,
      color: colors.textSecondary,
      marginLeft: 6,
    },
    refreshControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    manualRefreshButton: {
      backgroundColor: colors.surface,
      padding: 8,
      borderRadius: 20,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    pageTitle: {
      fontSize: typography.sizes['4xl'],
      fontFamily: typography.fonts.oleoBold,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 8,
      textShadowColor: 'rgba(255, 215, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    subtitle: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 24,
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.buttonText,
      fontFamily: typography.fonts.bold,
    },
    statsContainer: {
      flexDirection: 'row',
      marginHorizontal: 24,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fonts.bold,
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    transactionsList: {
      paddingHorizontal: 24,
    },
    transactionCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    transactionId: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusBadgeText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
    },
    pendingBadge: {
      backgroundColor: colors.warning + '20',
    },
    pendingText: {
      color: colors.warning,
    },
    completedBadge: {
      backgroundColor: colors.success + '20',
    },
    completedText: {
      color: colors.success,
    },
    failedBadge: {
      backgroundColor: colors.error + '20',
    },
    failedText: {
      color: colors.error,
    },
    transactionDetails: {
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.text,
    },
    transactionActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
    },
    approveButton: {
      backgroundColor: colors.success + '20',
    },
    approveButtonText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.success,
    },
    rejectButton: {
      backgroundColor: colors.error + '20',
    },
    rejectButtonText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.error,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
      marginTop: 16,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    notesInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.text,
      marginBottom: 20,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
    },
    confirmButton: {
      overflow: 'hidden',
    },
    confirmButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
    },
    settingsContainer: {
      paddingHorizontal: 24,
    },
    settingsSection: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 16,
    },
    vodafoneNumbersList: {
      marginBottom: 16,
    },
    vodafoneNumberItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    vodafoneNumberText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.text,
    },
    removeButton: {
      padding: 4,
    },
    addNumberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addNumberInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.text,
      marginRight: 12,
    },
    addNumberButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    addNumberButtonText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
    },
    screenshotContainer: {
      marginTop: 12,
      marginBottom: 8,
    },
    screenshotLabel: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 8,
    },
    screenshotPreview: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    screenshotPlaceholder: {
      width: '100%',
      height: 100,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    screenshotPlaceholderText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.textMuted,
      marginTop: 8,
    },
    screenshotActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    viewScreenshotButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.info + '20',
    },
    viewScreenshotText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
      color: colors.info,
      marginLeft: 4,
    },
    screenshotModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    screenshotModalContent: {
      width: '90%',
      height: '80%',
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    screenshotModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surface,
    },
    screenshotModalTitle: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fonts.bold,
      color: colors.text,
    },
    screenshotModalClose: {
      padding: 8,
    },
    screenshotModalImage: {
      flex: 1,
      width: '100%',
    },
  });

  useEffect(() => {
    loadData();
    
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Auto-refresh functionality
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Only auto-refresh for pending and all tabs, not settings
    if (activeTab === 'pending' || activeTab === 'all') {
      intervalId = setInterval(async () => {
        setAutoRefreshing(true);
        await loadData();
        setAutoRefreshing(false);
      }, 15000); // Refresh every 15 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'pending') {
        const data = await fetchPendingTransactions();
        setPendingTransactions(data);
      } else if (activeTab === 'all') {
        const data = await fetchAllTransactions();
        setAllTransactions(data);
      } else if (activeTab === 'settings') {
        const numbers = await fetchVodafoneNumbers();
        setVodafoneNumbers(numbers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleVerifyTransaction = (transaction: CoinTransaction, approved: boolean) => {
    setSelectedTransaction(transaction);
    setVerificationNotes('');
    setShowVerifyModal(true);
  };

  const submitVerification = async (approved: boolean) => {
    if (!selectedTransaction) return;

    try {
      const adminId = await getUserId();
      if (!adminId) {
        Alert.alert('Error', 'Admin user not found');
        return;
      }

      setProcessing(selectedTransaction.id);
      
      await verifyTransaction(
        selectedTransaction.id,
        approved,
        adminId,
        verificationNotes.trim() || undefined
      );

      await loadData();
      setShowVerifyModal(false);
      setSelectedTransaction(null);
      setVerificationNotes('');
      
      Toast.show({
        type: 'success',
        text1: approved ? 'Transaction Approved!' : 'Transaction Rejected',
        text2: approved ? 'Coins have been added to user account' : 'Transaction has been marked as failed',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Error verifying transaction:', error);
      Alert.alert('Error', 'Failed to verify transaction');
    } finally {
      setProcessing(null);
    }
  };

  const addVodafoneNumber = async () => {
    if (!newVodafoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid Vodafone number');
      return;
    }

    if (newVodafoneNumber.length !== 11 || !newVodafoneNumber.startsWith('01')) {
      Alert.alert('Error', 'Please enter a valid Egyptian mobile number (11 digits starting with 01)');
      return;
    }

    if (vodafoneNumbers.includes(newVodafoneNumber)) {
      Alert.alert('Error', 'This number is already added');
      return;
    }

    try {
      const updatedNumbers = [...vodafoneNumbers, newVodafoneNumber];
      await updateVodafoneNumbers(updatedNumbers);
      setVodafoneNumbers(updatedNumbers);
      setNewVodafoneNumber('');
      
      Toast.show({
        type: 'success',
        text1: 'Number Added',
        text2: 'Vodafone Cash number added successfully',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error adding number:', error);
      Alert.alert('Error', 'Failed to add number');
    }
  };

  const removeVodafoneNumber = async (numberToRemove: string) => {
    Alert.alert(
      'Remove Number',
      `Are you sure you want to remove ${numberToRemove}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedNumbers = vodafoneNumbers.filter(num => num !== numberToRemove);
              await updateVodafoneNumbers(updatedNumbers);
              setVodafoneNumbers(updatedNumbers);
              
              Toast.show({
                type: 'success',
                text1: 'Number Removed',
                text2: 'Vodafone Cash number removed successfully',
                visibilityTime: 2000,
              });
            } catch (error) {
              console.error('Error removing number:', error);
              Alert.alert('Error', 'Failed to remove number');
            }
          },
        },
      ]
    );
  };

  const viewScreenshot = (screenshot: string) => {
    setSelectedScreenshot(screenshot);
    setShowScreenshotModal(true);
  };

  const closeScreenshotModal = () => {
    setShowScreenshotModal(false);
    setSelectedScreenshot(null);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return [styles.statusBadge, styles.pendingBadge];
      case 'completed':
        return [styles.statusBadge, styles.completedBadge];
      case 'failed':
        return [styles.statusBadge, styles.failedBadge];
      default:
        return [styles.statusBadge];
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return [styles.statusBadgeText, styles.pendingText];
      case 'completed':
        return [styles.statusBadgeText, styles.completedText];
      case 'failed':
        return [styles.statusBadgeText, styles.failedText];
      default:
        return [styles.statusBadgeText];
    }
  };

  const renderTransactionCard = (transaction: CoinTransaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionId} numberOfLines={1}>
          ID: {transaction.id}
        </Text>
        <View style={getStatusBadgeStyle(transaction.status)}>
          <Text style={getStatusTextStyle(transaction.status)}>
            {transaction.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>{transaction.amount} EGP</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Coins:</Text>
          <Text style={styles.detailValue}>{transaction.coins.toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>User ID:</Text>
          <Text style={styles.detailValue}>{transaction.userId}</Text>
        </View>
        {transaction.vodafoneNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sender Number:</Text>
            <Text style={styles.detailValue}>{transaction.vodafoneNumber}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference:</Text>
          <Text style={styles.detailValue}>{transaction.paymentReference}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>
            {new Date(transaction.createdAt).toLocaleString()}
          </Text>
        </View>
        {transaction.adminNotes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue}>{transaction.adminNotes}</Text>
          </View>
        )}
      </View>

      {/* Payment Screenshot Section */}
      {transaction.paymentScreenshot && (
        <View style={styles.screenshotContainer}>
          <Text style={styles.screenshotLabel}>Payment Screenshot:</Text>
          <TouchableOpacity onPress={() => viewScreenshot(transaction.paymentScreenshot!)}>
            <Image
              source={{ 
                uri: transaction.paymentScreenshot.startsWith('data:') 
                  ? transaction.paymentScreenshot 
                  : `data:image/jpeg;base64,${transaction.paymentScreenshot}` 
              }}
              style={styles.screenshotPreview}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={styles.screenshotActions}>
            <TouchableOpacity
              style={styles.viewScreenshotButton}
              onPress={() => viewScreenshot(transaction.paymentScreenshot!)}
            >
              <Ionicons name="eye" size={16} color={colors.info} />
              <Text style={styles.viewScreenshotText}>View Full Size</Text>
            </TouchableOpacity>
          </View>
          {transaction.screenshotFileName && (
            <Text style={styles.screenshotPlaceholderText}>
              {transaction.screenshotFileName}
            </Text>
          )}
        </View>
      )}
      {!transaction.paymentScreenshot && (
        <View style={styles.screenshotContainer}>
          <Text style={styles.screenshotLabel}>Payment Screenshot:</Text>
          <View style={styles.screenshotPlaceholder}>
            <Ionicons name="image-outline" size={24} color={colors.textMuted} />
            <Text style={styles.screenshotPlaceholderText}>No screenshot uploaded</Text>
          </View>
        </View>
      )}

      {transaction.status === 'pending' && (
        <View style={styles.transactionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleVerifyTransaction(transaction, true)}
            disabled={processing === transaction.id}
          >
            {processing === transaction.id ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <Text style={styles.approveButtonText}>Approve</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleVerifyTransaction(transaction, false)}
            disabled={processing === transaction.id}
          >
            {processing === transaction.id ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Text style={styles.rejectButtonText}>Reject</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStats = () => {
    const pending = pendingTransactions.length;
    const completed = allTransactions.filter(t => t.status === 'completed').length;
    const totalAmount = allTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalAmount}</Text>
          <Text style={styles.statLabel}>Total EGP</Text>
        </View>
      </View>
    );
  };

  const renderPendingTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading pending transactions...</Text>
        </View>
      );
    }

    if (pendingTransactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Pending Transactions</Text>
          <Text style={styles.emptyMessage}>
            All transactions have been processed
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionsList}>
        {pendingTransactions.map(renderTransactionCard)}
      </View>
    );
  };

  const renderAllTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading all transactions...</Text>
        </View>
      );
    }

    if (allTransactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyMessage}>
            Transactions will appear here once users make purchases
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionsList}>
        {allTransactions.map(renderTransactionCard)}
      </View>
    );
  };

  const renderSettingsTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      );
    }

    return (
      <View style={styles.settingsContainer}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Vodafone Cash Numbers</Text>
          
          <View style={styles.vodafoneNumbersList}>
            {vodafoneNumbers.map((number) => (
              <View key={number} style={styles.vodafoneNumberItem}>
                <Text style={styles.vodafoneNumberText}>{number}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeVodafoneNumber(number)}
                >
                  <Ionicons name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addNumberContainer}>
            <TextInput
              style={styles.addNumberInput}
              value={newVodafoneNumber}
              onChangeText={setNewVodafoneNumber}
              placeholder="01XXXXXXXXX"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <TouchableOpacity
              style={styles.addNumberButton}
              onPress={addVodafoneNumber}
            >
              <Text style={styles.addNumberButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderVerificationModal = () => (
    <Modal
      visible={showVerifyModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowVerifyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verify Transaction</Text>
            <Text style={styles.modalSubtitle}>
              Add optional notes for this verification
            </Text>
          </View>

          <TextInput
            style={styles.notesInput}
            value={verificationNotes}
            onChangeText={setVerificationNotes}
            placeholder="Optional verification notes..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowVerifyModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton]}
              onPress={() => submitVerification(false)}
            >
              <LinearGradient
                colors={[colors.error, '#FF6B6B']}
                style={styles.modalButton}
              >
                <Text style={styles.confirmButtonText}>Reject</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton]}
              onPress={() => submitVerification(true)}
            >
              <LinearGradient
                colors={[colors.success, '#4ECDC4']}
                style={styles.modalButton}
              >
                <Text style={styles.confirmButtonText}>Approve</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.pageTitle}>Payment Management</Text>
                <Text style={styles.subtitle}>
                  Verify transactions and manage payment settings
                </Text>
              </View>
              <View style={styles.refreshControls}>
                {autoRefreshing && (
                  <View style={styles.autoRefreshIndicator}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.autoRefreshText}>Auto-refreshing...</Text>
                  </View>
                )}
                {(activeTab === 'pending' || activeTab === 'all') && (
                  <TouchableOpacity
                    style={styles.manualRefreshButton}
                    onPress={onRefresh}
                    disabled={refreshing || loading}
                  >
                    <Ionicons 
                      name="refresh" 
                      size={20} 
                      color={refreshing ? colors.textSecondary : colors.primary} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
              onPress={() => setActiveTab('pending')}
            >
              <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>

          {(activeTab === 'pending' || activeTab === 'all') && renderStats()}

          {activeTab === 'pending' && renderPendingTab()}
          {activeTab === 'all' && renderAllTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </Animated.View>
      </ScrollView>

      {renderVerificationModal()}
      
      {/* Screenshot Modal */}
      <Modal
        visible={showScreenshotModal}
        transparent
        animationType="fade"
        onRequestClose={closeScreenshotModal}
      >
        <View style={styles.screenshotModal}>
          <View style={styles.screenshotModalContent}>
            <View style={styles.screenshotModalHeader}>
              <Text style={styles.screenshotModalTitle}>Payment Screenshot</Text>
              <TouchableOpacity
                style={styles.screenshotModalClose}
                onPress={closeScreenshotModal}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {selectedScreenshot && (
              <Image
                source={{ 
                  uri: selectedScreenshot.startsWith('data:') 
                    ? selectedScreenshot 
                    : `data:image/jpeg;base64,${selectedScreenshot}` 
                }}
                style={styles.screenshotModalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}