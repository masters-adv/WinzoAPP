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
  Switch,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { CoinPackage } from '../types';
import { 
  fetchAllCoinPackages, 
  createCoinPackage, 
  updateCoinPackage, 
  deleteCoinPackage 
} from '../utils/api';
import Header from '../components/Header';

interface PackageFormData {
  name: string;
  coins: string;
  price: string;
  originalPrice: string;
  bonus: string;
  description: string;
  popular: boolean;
  isActive: boolean;
}

export default function AdminStoreScreen() {
  const { colors } = useTheme();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    coins: '',
    price: '',
    originalPrice: '',
    bonus: '',
    description: '',
    popular: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    title: {
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
    addButton: {
      marginHorizontal: 24,
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    addButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    addButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
      marginLeft: 8,
      letterSpacing: 0.5,
    },
    packagesList: {
      paddingHorizontal: 24,
    },
    packageCard: {
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
    packageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    packageName: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    packageActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 8,
    },
    editButton: {
      backgroundColor: colors.info + '20',
    },
    deleteButton: {
      backgroundColor: colors.error + '20',
    },
    packageDetails: {
      marginBottom: 12,
    },
    packageDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    packageDetailLabel: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
    },
    packageDetailValue: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.text,
    },
    packageStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    statusBadgeActive: {
      backgroundColor: colors.success + '20',
    },
    statusBadgeInactive: {
      backgroundColor: colors.error + '20',
    },
    statusBadgeText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
    },
    statusTextActive: {
      color: colors.success,
    },
    statusTextInactive: {
      color: colors.error,
    },
    popularBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    popularBadgeText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
      color: colors.primary,
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
      maxHeight: '80%',
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
      color: colors.text,
    },
    closeButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    formContainer: {
      maxHeight: 400,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 8,
    },
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
    inputFocused: {
      borderColor: colors.primary,
    },
    switchGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
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
    submitButton: {
      overflow: 'hidden',
    },
    submitButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
    },
  });

  useEffect(() => {
    loadPackages();
    
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

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCoinPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      Alert.alert('Error', 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      coins: '',
      price: '',
      originalPrice: '',
      bonus: '',
      description: '',
      popular: false,
      isActive: true,
    });
    setEditingPackage(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (pkg: CoinPackage) => {
    setFormData({
      name: pkg.name,
      coins: pkg.coins.toString(),
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice?.toString() || '',
      bonus: pkg.bonus?.toString() || '',
      description: pkg.description || '',
      popular: pkg.popular || false,
      isActive: pkg.isActive,
    });
    setEditingPackage(pkg);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Package name is required');
      return false;
    }
    if (!formData.coins.trim() || isNaN(Number(formData.coins)) || Number(formData.coins) <= 0) {
      Alert.alert('Error', 'Valid coins amount is required');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const packageData = {
        name: formData.name.trim(),
        coins: Number(formData.coins),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        bonus: formData.bonus ? Number(formData.bonus) : undefined,
        description: formData.description.trim() || undefined,
        popular: formData.popular,
        isActive: formData.isActive,
      };

      if (editingPackage) {
        await updateCoinPackage(editingPackage.id, packageData);
      } else {
        await createCoinPackage(packageData);
      }

      await loadPackages();
      closeModal();
      
      Alert.alert(
        'Success', 
        editingPackage ? 'Package updated successfully' : 'Package created successfully'
      );
    } catch (error) {
      console.error('Error saving package:', error);
      Alert.alert('Error', 'Failed to save package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (pkg: CoinPackage) => {
    Alert.alert(
      'Delete Package',
      `Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCoinPackage(pkg.id);
              await loadPackages();
              Alert.alert('Success', 'Package deleted successfully');
            } catch (error) {
              console.error('Error deleting package:', error);
              Alert.alert('Error', 'Failed to delete package');
            }
          },
        },
      ]
    );
  };

  const renderPackageCard = (pkg: CoinPackage) => (
    <View key={pkg.id} style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <View style={styles.packageActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(pkg)}
          >
            <Ionicons name="create" size={20} color={colors.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(pkg)}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.packageDetails}>
        <View style={styles.packageDetailRow}>
          <Text style={styles.packageDetailLabel}>Coins:</Text>
          <Text style={styles.packageDetailValue}>{pkg.coins.toLocaleString()}</Text>
        </View>
        <View style={styles.packageDetailRow}>
          <Text style={styles.packageDetailLabel}>Price:</Text>
          <Text style={styles.packageDetailValue}>{pkg.price} EGP</Text>
        </View>
        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
          <View style={styles.packageDetailRow}>
            <Text style={styles.packageDetailLabel}>Original Price:</Text>
            <Text style={styles.packageDetailValue}>{pkg.originalPrice} EGP</Text>
          </View>
        )}
        {pkg.bonus && pkg.bonus > 0 && (
          <View style={styles.packageDetailRow}>
            <Text style={styles.packageDetailLabel}>Bonus Coins:</Text>
            <Text style={styles.packageDetailValue}>+{pkg.bonus}</Text>
          </View>
        )}
        {pkg.description && (
          <View style={styles.packageDetailRow}>
            <Text style={styles.packageDetailLabel}>Description:</Text>
            <Text style={styles.packageDetailValue}>{pkg.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.packageStatus}>
        <View style={[styles.statusBadge, pkg.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
          <Text style={[styles.statusBadgeText, pkg.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
            {pkg.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={showAddModal}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Package Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Starter Pack"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Coins *</Text>
              <TextInput
                style={styles.input}
                value={formData.coins}
                onChangeText={(text) => setFormData(prev => ({ ...prev, coins: text }))}
                placeholder="e.g., 100"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (EGP) *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="e.g., 100"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Original Price (EGP)</Text>
              <TextInput
                style={styles.input}
                value={formData.originalPrice}
                onChangeText={(text) => setFormData(prev => ({ ...prev, originalPrice: text }))}
                placeholder="e.g., 120 (for discount display)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bonus Coins</Text>
              <TextInput
                style={styles.input}
                value={formData.bonus}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bonus: text }))}
                placeholder="e.g., 10"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="e.g., Perfect for beginners"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>Mark as Popular</Text>
              <Switch
                value={formData.popular}
                onValueChange={(value) => setFormData(prev => ({ ...prev, popular: value }))}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={formData.popular ? colors.primary : colors.textMuted}
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>Active</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                trackColor={{ false: colors.border, true: colors.success + '40' }}
                thumbColor={formData.isActive ? colors.success : colors.textMuted}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={closeModal}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.modalButton}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingPackage ? 'Update' : 'Create'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && packages.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </View>
    );
  }

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
            <Text style={styles.title}>Store Management</Text>
            <Text style={styles.subtitle}>
              Manage coin packages and pricing
            </Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={24} color={colors.buttonText} />
              <Text style={styles.addButtonText}>Add New Package</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.packagesList}>
            {packages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Packages Yet</Text>
                <Text style={styles.emptyMessage}>
                  Create your first coin package to get started
                </Text>
              </View>
            ) : (
              packages.map(renderPackageCard)
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {renderModal()}
    </View>
  );
}
