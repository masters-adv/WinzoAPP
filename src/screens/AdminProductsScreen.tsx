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
import { ProductService } from '../services/database';
import Header from '../components/Header';

export default function AdminProductsScreen() {
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProductActions, setShowProductActions] = useState(false);

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
      const newProduct = await ProductService.addProduct({
        ...formData,
        lowestBid: 0,
        lowestBidder: 'N/A',
      });
      
      setProducts([...products, newProduct]);
      resetForm();
      Alert.alert('Success', 'Product added successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async () => {
    if (!formData.name || !formData.description || !formData.endTime || !editingProduct) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const updatedProduct = {
        ...editingProduct,
        ...formData,
      };
      
      // Update in database
      await ProductService.updateProduct(editingProduct.id, updatedProduct);
      
      // Update local state
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      resetForm();
      Alert.alert('Success', 'Product updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProductService.deleteProduct(product.id);
              setProducts(products.filter(p => p.id !== product.id));
              Alert.alert('Success', 'Product deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleEditPress = (product: Product) => {
    setEditingProduct(product);
    setIsEditing(true);
    setFormData({
      name: product.name,
      description: product.description,
      image: product.image,
      endTime: new Date(product.endTime).toISOString().split('T')[0],
      aiHint: product.aiHint,
    });
    setModalVisible(true);
  };

  const handleToggleProductStatus = async (product: Product) => {
    const isActive = !(product as any).inactive || false;
    const action = isActive ? 'deactivate' : 'activate';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
      `Are you sure you want to ${action} "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              const updatedProduct = { ...product, inactive: isActive };
              await ProductService.updateProduct(product.id, updatedProduct);
              setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
              Alert.alert('Success', `Product ${isActive ? 'deactivated' : 'activated'} successfully`);
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} product`);
            }
          }
        }
      ]
    );
  };

  const handleToggleFeatured = async (product: Product) => {
    const isFeatured = (product as any).featured || false;
    const action = isFeatured ? 'remove from featured' : 'add to featured';
    
    try {
      const updatedProduct = { ...product, featured: !isFeatured };
      await ProductService.updateProduct(product.id, updatedProduct);
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
      Alert.alert('Success', `Product ${isFeatured ? 'removed from featured' : 'added to featured'} successfully`);
    } catch (error) {
      Alert.alert('Error', `Failed to ${action}`);
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (Copy)`,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };
      delete (duplicatedProduct as any).id; // Remove ID so a new one is generated
      
      const newProduct = await ProductService.addProduct(duplicatedProduct);
      setProducts([...products, newProduct]);
      Alert.alert('Success', 'Product duplicated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate product');
    }
  };

  const resetForm = () => {
    setModalVisible(false);
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      image: 'https://placehold.co/600x600.png',
      endTime: '',
      aiHint: '',
    });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isInactive = (item as any).inactive || false;
    const isFeatured = (item as any).featured || false;
    const isExpired = new Date(item.endTime) < new Date();
    
    return (
      <View style={[styles.productCard, { 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        opacity: isInactive ? 0.6 : 1
      }]}>
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.productBadges}>
              {isFeatured && (
                <View style={[styles.badge, styles.featuredBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.warning }]}>FEATURED</Text>
                </View>
              )}
              {isInactive && (
                <View style={[styles.badge, styles.inactiveBadge, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.error }]}>INACTIVE</Text>
                </View>
              )}
              {isExpired && (
                <View style={[styles.badge, styles.expiredBadge, { backgroundColor: colors.textMuted + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.textMuted }]}>EXPIRED</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.productStats}>
            <Text style={[styles.statText, { color: colors.textMuted }]}>Lowest Bid: ${item.lowestBid.toFixed(2)}</Text>
            <Text style={[styles.statText, { color: colors.textMuted }]}>End: {new Date(item.endTime).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => handleEditPress(item)}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.duplicateButton, { backgroundColor: colors.info + '20' }]}
            onPress={() => handleDuplicateProduct(item)}
          >
            <Ionicons name="copy-outline" size={18} color={colors.info} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.featuredButton, { 
              backgroundColor: isFeatured ? colors.warning + '20' : colors.success + '20' 
            }]}
            onPress={() => handleToggleFeatured(item)}
          >
            <Ionicons 
              name={isFeatured ? "star" : "star-outline"} 
              size={18} 
              color={isFeatured ? colors.warning : colors.success} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.statusButton, { 
              backgroundColor: isInactive ? colors.success + '20' : colors.warning + '20' 
            }]}
            onPress={() => handleToggleProductStatus(item)}
          >
            <Ionicons 
              name={isInactive ? "play-circle-outline" : "pause-circle-outline"} 
              size={18} 
              color={isInactive ? colors.success : colors.warning} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error + '20' }]}
            onPress={() => handleDeleteProduct(item)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
          <TouchableOpacity onPress={resetForm}>
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

            <TouchableOpacity onPress={isEditing ? handleEditProduct : handleAddProduct} disabled={submitting}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.submitButtonText}>{isEditing ? 'Update Product' : 'Add Product'}</Text>
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productBadges: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadge: {},
  inactiveBadge: {},
  expiredBadge: {},
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bold,
  },
  productActions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {},
  duplicateButton: {},
  featuredButton: {},
  statusButton: {},
  deleteButton: {},
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
