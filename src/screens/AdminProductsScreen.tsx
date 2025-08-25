import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Product } from '../types';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import { fetchProducts, addProduct } from '../utils/api';
import Header from '../components/Header';

export default function AdminProductsScreen() {
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: 'https://placehold.co/600x600.png',
    endTime: '',
    aiHint: '',
  });

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

  const handleAddProduct = async () => {
    if (!formData.name || !formData.description || !formData.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const newProduct = await addProduct({
        ...formData,
        lowestBid: 0,
        lowestBidder: 'N/A',
      });
      
      setProducts([...products, newProduct]);
      setModalVisible(false);
      setFormData({
        name: '',
        description: '',
        image: 'https://placehold.co/600x600.png',
        endTime: '',
        aiHint: '',
      });
      Alert.alert('Success', 'Product added successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productStats}>
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            Lowest Bid: ${item.lowestBid.toFixed(2)}
          </Text>
          <Text style={[styles.statText, { color: colors.textMuted }]}>
            End: {new Date(item.endTime).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="create-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.pageTitle, { color: colors.primary }]}>Products</Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color={colors.buttonText} />
        <Text style={[styles.addButtonText, { color: colors.buttonText }]}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddProductModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter product name"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter product description"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Date *</Text>
              <TextInput
                style={styles.input}
                value={formData.endTime}
                onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                placeholder="YYYY-MM-DDTHH:MM:SS.000Z"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>AI Hint</Text>
              <TextInput
                style={styles.input}
                value={formData.aiHint}
                onChangeText={(text) => setFormData({ ...formData, aiHint: text })}
                placeholder="Enter AI hint for product"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <TouchableOpacity onPress={handleAddProduct} disabled={submitting}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.submitButtonText}>Add Product</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <Header />
        <View style={commonStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading products...</Text>
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
        contentContainerStyle={styles.listContainer}
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
      {renderAddProductModal()}
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
    marginBottom: 16,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.regular,
  },
  editButton: {
    padding: 8,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.bold,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
  },
});
