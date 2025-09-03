import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { Product } from '../types';
import { ProductService } from '../services/database';
import CountdownTimer from '../components/CountdownTimer';
import Header from '../components/Header';
import { AuctionsStackParamList } from '../navigation/AuctionsStackNavigator';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced responsive breakpoints
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
const isTablet = screenWidth >= 768 && screenWidth < 1024;
const isLargeScreen = screenWidth >= 1024;
const isExtraLarge = screenWidth >= 1440;

// Responsive scaling functions
const getResponsiveSize = (small: number, medium: number, tablet: number, large: number, extraLarge?: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  if (isTablet) return tablet;
  if (isExtraLarge && extraLarge) return extraLarge;
  return large;
};

// Dynamic responsive constants
const CONTAINER_PADDING = getResponsiveSize(12, 16, 24, 32, 40);
const CARD_MARGIN = getResponsiveSize(8, 12, 16, 20, 24);
const numColumns = getResponsiveSize(1, 2, 3, 4, 5);
const cardWidth = (screenWidth - (CONTAINER_PADDING * 2) - (CARD_MARGIN * (numColumns - 1))) / numColumns;
const maxCardWidth = 320; // Maximum card width for very large screens
const finalCardWidth = Math.min(cardWidth, maxCardWidth);

type AuctionsScreenNavigationProp = NativeStackNavigationProp<AuctionsStackParamList, 'AuctionsList'>;

export default function AuctionsScreen() {
  const navigation = useNavigation<AuctionsScreenNavigationProp>();
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await ProductService.fetchProducts();
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

  const renderAuctionCard = ({ item, index }: { item: Product; index: number }) => {
    const timeLeft = new Date(item.endTime).getTime() - new Date().getTime();
    const isLive = timeLeft > 0;
    const isEndingSoon = timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
    
    const getStatusBadge = () => {
      if (!isLive) {
        return { text: 'ENDED', color: '#6B7280', icon: 'time-outline' };
      } else if (isEndingSoon) {
        return { text: 'ENDING SOON', color: '#EF4444', icon: 'flash-outline' };
      } else {
        return { text: 'LIVE', color: '#10B981', icon: 'radio-outline' };
      }
    };
    
    const status = getStatusBadge();
    
    return (
      <View style={styles.verticalCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AuctionDetail', { product: item })}
          activeOpacity={0.8}
          style={styles.cardTouchable}
        >
          {/* Cover Photo Container */}
          <View style={styles.coverPhotoContainer}>
            <Image source={{ uri: item.image }} style={styles.coverPhoto} />
            
            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>
              <LinearGradient
                colors={[status.color, status.color + '80']}
                style={styles.statusBadge}
              >
                <Ionicons name={status.icon as any} size={12} color="white" />
                <Text style={styles.statusText}>{status.text}</Text>
              </LinearGradient>
            </View>
            
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradientOverlay}
            />
          </View>
          
          {/* Card Content */}
          <View style={[styles.cardContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </Text>
            
            {/* Bid Information */}
            <View style={styles.bidSection}>
              <View style={styles.bidInfo}>
                <Text style={[styles.bidLabel, { color: colors.textMuted }]}>Current Bid</Text>
                <LinearGradient
                  colors={[colors.primary, colors.primary + '80']}
                  style={styles.bidAmountContainer}
                >
                  <Text style={styles.bidAmount}>₹{item.lowestBid}</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.timerSection}>
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color={timeLeft > 0 ? colors.error : colors.textMuted} 
                />
                <CountdownTimer 
                  endTime={item.endTime} 
                  compact={true}
                  style={[styles.timer, { color: timeLeft > 0 ? colors.error : colors.textMuted }]}
                />
              </View>
            </View>
            
            <Text style={[styles.bidder, { color: colors.textSecondary }]}>by {item.lowestBidder}</Text>
            
            {/* Action Button */}
            <LinearGradient
              colors={timeLeft > 0 ? [colors.primary, colors.primary + '80'] : ['#6B7280', '#6B728080']}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>
                {timeLeft > 0 ? 'Place Bid' : 'View Details'}
              </Text>
              <Ionicons 
                name={timeLeft > 0 ? "flash" : "eye-outline"} 
                size={16} 
                color="white" 
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>
    );
  };



  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Auctions" />
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading auctions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Auctions" />
      <FlatList
          data={products}
          renderItem={renderAuctionCard}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={6}
          getItemLayout={(data, index) => ({
            length: cardWidth * 0.8 + (isTablet ? 160 : 140) + (isTablet ? 20 : 16),
            offset: (cardWidth * 0.8 + (isTablet ? 160 : 140) + (isTablet ? 20 : 16)) * Math.floor(index / numColumns),
            index,
          })}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
    </View>
  );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: isTablet ? 32 : 24,
    paddingTop: isTablet ? 32 : 20,
    paddingHorizontal: CONTAINER_PADDING,
  },
  pageTitle: {
    fontSize: isTablet ? 48 : typography.sizes['4xl'],
    fontFamily: typography.fonts.oleoBold,
    textAlign: 'center',
    fontWeight: typography.weights.bold,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingTop: getResponsiveSize(6, 8, 12, 16),
    paddingBottom: getResponsiveSize(24, 32, 40, 48),
    alignItems: isLargeScreen ? 'center' : 'stretch',
    maxWidth: isExtraLarge ? 1600 : undefined,
    alignSelf: isExtraLarge ? 'center' : 'stretch',
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
    marginBottom: isTablet ? 20 : 16,
    paddingHorizontal: 0,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    marginTop: 16,
  },
  // New Vertical Card Styles
  verticalCard: {
    width: finalCardWidth,
    height: finalCardWidth * (isSmallScreen ? 1.9 : 1.8),
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(12, 14, 16, 18),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginHorizontal: getResponsiveSize(1, 2, 4, 6),
    alignSelf: 'center',
  },
  cardTouchable: {
    flex: 1,
  },
  coverPhotoContainer: {
    position: 'relative',
    height: finalCardWidth * (isSmallScreen ? 0.65 : 0.6),
    overflow: 'hidden',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  statusBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardContent: {
    padding: getResponsiveSize(6, 8, 12, 14),
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: getResponsiveSize(typography.sizes.xs, typography.sizes.sm, typography.sizes.base, typography.sizes.lg),
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    marginBottom: getResponsiveSize(2, 3, 4, 5),
    lineHeight: getResponsiveSize(14, 16, 18, 20),
  },
  cardDescription: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.regular,
    marginBottom: 4,
    lineHeight: 12,
    opacity: 0.8,
  },
  bidSection: {
    marginBottom: 4,
  },
  bidInfo: {
    marginBottom: 4,
  },
  bidLabel: {
    fontSize: 10,
    fontFamily: typography.fonts.regular,
    marginBottom: 2,
  },
  bidAmountContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bidAmount: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timer: {
    fontSize: 10,
    fontFamily: typography.fonts.medium,
    fontWeight: typography.weights.medium,
  },
  bidder: {
    fontSize: 10,
    fontFamily: typography.fonts.regular,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    marginTop: 'auto', // Push button to bottom
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
});
