import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { Product } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import { getUserCoins, updateUserCoins, storeTransactionHistory, getTransactionHistory } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints and constants
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768 && width < 1024;
const isLargeScreen = width >= 1024;
const isExtraLarge = width >= 1440;

// Responsive scaling functions
const getResponsiveSize = (small: number, medium: number, tablet: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  if (isTablet) return tablet;
  return large;
};

const getResponsivePadding = () => getResponsiveSize(12, 16, 24, 32);
const getResponsiveMargin = () => getResponsiveSize(8, 12, 16, 20);
const getResponsiveFontScale = () => getResponsiveSize(0.9, 1, 1.1, 1.2);

interface AuctionDetailScreenProps {
  route: {
    params: {
      product: Product;
    };
  };
  navigation: any;
}

export default function AuctionDetailScreen({ route, navigation }: AuctionDetailScreenProps) {
  const { colors } = useTheme();
  
  // Error handling for missing product
  if (!route?.params?.product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontSize: 18, marginBottom: 20 }}>Product not found</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const { product } = route.params;
  const [selectedProduct, setSelectedProduct] = useState<Product>(product);
  const [bidAmount, setBidAmount] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dynamicBidAmount, setDynamicBidAmount] = useState(product.lowestBid);
  const [bidCount, setBidCount] = useState(Math.floor(Math.random() * 50) + 20);
  const [userBidPlaced, setUserBidPlaced] = useState(false);
  const [userBidAmount, setUserBidAmount] = useState(0);
  const [userBidHistory, setUserBidHistory] = useState<Array<{amount: number, timestamp: Date, id: string}>>([]);
  const [userCoins, setUserCoins] = useState(0);
  const BID_COST = 30; // Cost per bid in coins

  // Load user's actual coin balance and bid history on component mount and when screen is focused
  const loadUserData = async () => {
    try {
      const coins = await getUserCoins();
      setUserCoins(coins);
      
      // Load bid history for this auction from transaction history
       const transactions = await getTransactionHistory();
       const auctionBids = transactions
         .filter(t => t.paymentMethod === 'bid_placement' && (t as any).auctionId === selectedProduct.id)
         .map(t => ({
           amount: (t as any).bidAmount || 0,
           timestamp: new Date(t.createdAt),
           id: t.id
         }))
         .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setUserBidHistory(auctionBids);
      
      // Set user bid placed status if there are any bids
      if (auctionBids.length > 0) {
        setUserBidPlaced(true);
        setUserBidAmount(auctionBids[0].amount);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserCoins(0);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [selectedProduct.id]);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [selectedProduct.id])
  );
  
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Get auction status
  const getAuctionStatus = () => {
    const now = new Date();
    const endTime = new Date(selectedProduct.endTime);
    const timeLeft = endTime.getTime() - now.getTime();
    const isLive = timeLeft > 0;
    const isEndingSoon = timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
    
    if (!isLive) {
      return { text: 'AUCTION ENDED', color: colors.textMuted, isActive: false, emoji: '⏰' };
    } else if (isEndingSoon) {
      return { text: 'ENDING SOON', color: colors.warning, isActive: true, emoji: '🔥' };
    } else {
      return { text: 'LIVE AUCTION', color: colors.gradientRed, isActive: true, emoji: '🔥' };
    }
  };
  
  const auctionStatus = getAuctionStatus();

  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
    };
  }, []);

  useEffect(() => {
    // Dynamic bid simulation with proper dependency management
    const bidInterval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(selectedProduct.endTime);
      const timeLeft = endTime.getTime() - now.getTime();
      const isActive = timeLeft > 0;
      
      if (isActive) {
        // Continue simulation even after user places bid
        const change = Math.floor(Math.random() * 15) + 1; // +1 to +15
        setDynamicBidAmount(prev => prev + change);
        
        if (Math.random() > 0.8) {
          setBidCount(prev => prev + 1);
        }
      }
    }, 3000); // Update every 3 seconds to avoid infinite loops
    
    return () => {
      clearInterval(bidInterval);
    };
  }, [selectedProduct.endTime]);

  const handleBid = async () => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      Alert.alert('Invalid Bid', 'Please enter a valid bid amount.');
      return;
    }

    const numericBid = Number(bidAmount);
    
    if (numericBid <= 0) {
      Alert.alert('Invalid Bid', 'Please enter a positive amount.');
      return;
    }

    // Check if user has enough coins
    if (userCoins < BID_COST) {
      Alert.alert('Insufficient Coins', `You need ${BID_COST} coins to place a bid. You have ${userCoins} coins.`);
      return;
    }

    // Deduct coins from user balance and update in storage
    const newBalance = userCoins - BID_COST;
    setUserCoins(newBalance);
    
    // Update the balance in persistent storage
    try {
      await updateUserCoins(newBalance);
    } catch (error) {
      console.error('Error updating user coins in storage:', error);
      // Revert local state if storage update fails
      setUserCoins(userCoins);
      Alert.alert('Error', 'Failed to update coin balance. Please try again.');
      return;
    }

    // Add bid to user's history
    const newBid = {
      amount: numericBid,
      timestamp: new Date(),
      id: Date.now().toString()
    };
    setUserBidHistory(prev => [newBid, ...prev]); // Add new bid at the beginning

    // Store bid as a transaction in persistent storage
    const transaction = {
      id: Date.now().toString(),
      userId: 1, // Default user ID
      packageId: 0, // Not applicable for bids
      amount: -BID_COST,
      coins: -BID_COST,
      paymentMethod: 'bid_placement',
      paymentReference: `bid_${selectedProduct.id}_${Date.now()}`,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      adminNotes: `Bid placed: ₹${numericBid} on ${selectedProduct.name}`,
      // Custom fields for bid tracking
      auctionId: selectedProduct.id,
      bidAmount: numericBid
    };
    
    try {
      await storeTransactionHistory(transaction);
    } catch (error) {
      console.error('Error storing bid transaction:', error);
    }

    // Update the live bid activity with user's bid
    setDynamicBidAmount(numericBid);
    setBidCount(prev => prev + 1);
    setUserBidPlaced(true);
    setUserBidAmount(numericBid);
    
    // Show success message
    Alert.alert(
      'Bid Placed Successfully! 🎉', 
      `Your prediction of ₹${numericBid} has been submitted.\n${BID_COST} coins deducted from your balance.`,
      [
        {
          text: 'Great!',
          style: 'default'
        }
      ]
    );
    
    setBidAmount('');
  };



  const getProductImages = (product: Product) => {
    return [
      product.image,
      product.image.replace('300x200', '300x200/87CEEB'),
      product.image.replace('300x200', '300x200/98FB98'),
    ];
  };

  const productImages = getProductImages(selectedProduct);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.surface, colors.background]}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.cardOverlay }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Live Auction</Text>
        <View style={[styles.headerAccent, { backgroundColor: colors.neonGold }]} />
      </LinearGradient>

      {/* Status Indicator */}
        <View style={[styles.liveIndicator, {
          backgroundColor: auctionStatus.isActive ? 
            (auctionStatus.text === 'ENDING SOON' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)') :
            'rgba(158, 158, 158, 0.1)',
          borderLeftWidth: 4,
          borderLeftColor: auctionStatus.isActive ? 
            (auctionStatus.text === 'ENDING SOON' ? '#FF9800' : '#4CAF50') :
            '#9E9E9E'
        }]}>
          <Animated.View style={[styles.liveDot, { 
            transform: auctionStatus.isActive ? [{ scale: pulseAnim }] : [{ scale: 1 }],
            backgroundColor: auctionStatus.isActive ? 
              (auctionStatus.text === 'ENDING SOON' ? '#FF9800' : '#4CAF50') :
              '#9E9E9E'
          }]} />
          <Text style={[styles.liveText, { color: colors.text }]}>{auctionStatus.emoji} {auctionStatus.text}</Text>
        </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Product Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            contentContainerStyle={styles.galleryContent}
          >
            {productImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.productImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {productImages.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  // Scroll to specific image
                  const scrollView = React.createRef();
                  scrollView.current?.scrollTo({ x: index * width, animated: true });
                  setCurrentImageIndex(index);
                }}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentImageIndex ? colors.primary : 'rgba(255,255,255,0.5)',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
         <View style={[styles.productInfo, { 
           backgroundColor: colors.surface,
           borderColor: colors.primary + '30',
           borderWidth: 1
         }]}>
          <View style={styles.productHeader}>
            <Text style={[styles.productName, { color: colors.text }]}>
              {selectedProduct.name}
            </Text>
            <TouchableOpacity style={[styles.favoriteButton, { 
               backgroundColor: colors.cardOverlay,
               borderColor: colors.neonGold,
               borderWidth: 1
             }]}>
               <Ionicons name="heart-outline" size={24} color={colors.neonGold} />
             </TouchableOpacity>
          </View>
          
          <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
            {selectedProduct.description}
          </Text>
          
          {/* Bid Info */}
           <View style={styles.bidInfoContainer}>
             {/* Live Bid Activity Section */}
             <View style={styles.bidActivitySection}>
               <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Live Predictions</Text>
               <View style={styles.bidActivityContent}>
                 <LinearGradient
                   colors={[colors.gradientStart, colors.gradientEnd]}
                   style={[styles.bidAmountContainer, {
                     shadowColor: colors.primary,
                     shadowOpacity: 0.3,
                     shadowRadius: 8,
                     elevation: 4
                   }]}
                 >
                   <Text style={[styles.bidAmount, { color: colors.buttonText }]}>₹{dynamicBidAmount}</Text>
                 </LinearGradient>
                 <View style={styles.bidStatsRow}>
                   <View style={styles.bidStat}>
                      <Text style={[styles.bidStatNumber, { color: colors.primary }]}>{bidCount}</Text>
                      <Text style={[styles.bidStatLabel, { color: colors.textSecondary }]}>Predictions</Text>
                    </View>
                    <View style={styles.bidStat}>
                      <Text style={[styles.bidStatNumber, { color: colors.success }]}>{Math.floor(bidCount * 0.3)}</Text>
                      <Text style={[styles.bidStatLabel, { color: colors.textSecondary }]}>Participants</Text>
                    </View>
                 </View>
               </View>
              </View>

              {/* User Bid History Section */}
              {userBidHistory.length > 0 && (
                <View style={styles.userBidHistorySection}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Your Predictions</Text>
                  <View style={styles.bidHistoryContainer}>
                    {userBidHistory.slice(0, 3).map((bid) => (
                      <View key={bid.id} style={styles.bidHistoryItem}>
                        <View style={styles.bidHistoryContent}>
                          <Text style={[styles.bidHistoryAmount, { color: colors.primary }]}>₹{bid.amount}</Text>
                          <Text style={[styles.bidHistoryTime, { color: colors.textSecondary }]}>
                            {bid.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {bid.timestamp.toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={[styles.bidHistoryCost, { backgroundColor: colors.error + '20' }]}>
                          <Text style={[styles.bidHistoryCostText, { color: colors.error }]}>-{BID_COST} coins</Text>
                        </View>
                      </View>
                    ))}
                    {userBidHistory.length > 3 && (
                      <Text style={[styles.moreHistoryText, { color: colors.textMuted }]}>
                        +{userBidHistory.length - 3} more predictions
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Timer Section */}
             <View style={styles.timerSection}>
               <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Time Remaining</Text>
               <CountdownTimer 
                 endTime={selectedProduct.endTime} 
                 style={[styles.countdown, { color: colors.error }]} 
               />
               <Text style={[styles.urgencyText, { color: colors.warning }]}>⚡ Auction ending soon!</Text>
             </View>
           </View>
        </View>
      </ScrollView>

      {/* Bid Interface */}
       <LinearGradient
         colors={[colors.surface, colors.background]}
         style={[styles.bidInterface, { borderTopColor: colors.primary + '50', borderTopWidth: 2 }]}
       >
          {/* Coin Balance Display */}
          <View style={styles.coinBalanceContainer}>
            <Ionicons name="diamond" size={16} color={colors.primary} />
            <Text style={[styles.coinBalanceText, { color: colors.primary }]}>
              {userCoins} coins
            </Text>
            <Text style={[styles.bidCostText, { color: colors.textSecondary }]}>
              ({BID_COST} coins per bid)
            </Text>
          </View>
          
        {/* Bid Input */}
         <View style={styles.bidInputContainer}>
           <View style={[styles.bidInputWrapper, {
              backgroundColor: auctionStatus.isActive ? colors.surface : colors.background,
              borderColor: auctionStatus.isActive ? colors.primary + '50' : colors.textMuted + '30',
              borderWidth: 2,
              opacity: auctionStatus.isActive ? 1 : 0.5
            }]}>
              <TextInput
                style={[styles.bidInput, { color: auctionStatus.isActive ? colors.text : colors.textMuted }]}
                placeholder={auctionStatus.isActive ? "Enter your bid amount" : "Auction has ended"}
                placeholderTextColor={colors.textMuted}
                value={bidAmount}
                onChangeText={auctionStatus.isActive ? setBidAmount : undefined}
                keyboardType="numeric"
                editable={auctionStatus.isActive}
              />
            </View>
          <TouchableOpacity 
             onPress={() => {
               if (auctionStatus.isActive) {
                 handleBid();
               } else {
                 Alert.alert('Auction Ended', 'This auction has already ended.');
               }
             }} 
             disabled={!auctionStatus.isActive}
             style={{ opacity: auctionStatus.isActive ? 1 : 0.6 }}
           >
             <LinearGradient
               colors={auctionStatus.isActive ? [colors.gradientStart, colors.gradientEnd] : [colors.textMuted, colors.surface]}
               style={[styles.bidButton, {
                 shadowColor: auctionStatus.isActive ? colors.primary : colors.textMuted,
                 shadowOpacity: auctionStatus.isActive ? 0.6 : 0.2,
                 shadowRadius: auctionStatus.isActive ? 15 : 5,
                 elevation: auctionStatus.isActive ? 10 : 3,
                 opacity: auctionStatus.isActive ? 1 : 0.6
               }]}
             >
               <Ionicons name={auctionStatus.isActive ? "hammer" : "time-outline"} size={20} color={auctionStatus.isActive ? colors.buttonText : colors.text} />
               <Text style={[styles.bidButtonText, { color: auctionStatus.isActive ? colors.buttonText : colors.text }]}>
                 {auctionStatus.isActive ? 'Submit Prediction' : 'Auction Ended'}
               </Text>
             </LinearGradient>
           </TouchableOpacity>
        </View>
        

       </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerAccent: {
    width: 3,
    height: 24,
    borderRadius: 1.5,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingLeft: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  liveText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  scrollContainer: {
    flex: 1,
  },
  galleryContainer: {
    position: 'relative',
  },
  galleryContent: {
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: isTablet ? Math.min(width * 0.6, 400) : width * 0.75,
    maxHeight: isLargeScreen ? 500 : undefined,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  productInfo: {
    margin: getResponsiveMargin(),
    padding: getResponsivePadding(),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: isLargeScreen ? 800 : undefined,
    alignSelf: isLargeScreen ? 'center' : 'stretch',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: typography.sizes['2xl'] * getResponsiveFontScale(),
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  productDescription: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    lineHeight: 22,
    marginBottom: 20,
  },
  bidInfoContainer: {
    marginTop: 20,
    gap: 20,
  },
  bidActivitySection: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  bidActivityContent: {
    alignItems: 'center',
    gap: 12,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bidStatsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  bidStat: {
    alignItems: 'center',
  },
  bidStatNumber: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  bidStatLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.regular,
    marginTop: 2,
  },
  bidAmountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bidAmount: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    color: 'white',
  },
  timerSection: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    marginTop: 8,
    textAlign: 'center',
  },
  countdown: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },

  bidInterface: {
    padding: getResponsivePadding(),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: isLargeScreen ? 800 : undefined,
    alignSelf: isLargeScreen ? 'center' : 'stretch',
  },

  bidInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bidInputWrapper: {
    flex: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bidInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.regular,
    backgroundColor: 'transparent',
  },
  bidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    minWidth: 110,
    justifyContent: 'center',
  },
  bidButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  bidHint: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.8,
  },
  userBidHistorySection: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bidHistoryContainer: {
    gap: 12,
  },
  bidHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 2,
  },
  bidHistoryContent: {
    flex: 1,
    paddingRight: 12,
  },
  bidHistoryAmount: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    color: '#F3F4F6',
    marginBottom: 4,
  },
  bidHistoryTime: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: '#D1D5DB',
    opacity: 0.8,
  },
  bidHistoryCost: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  bidHistoryCostText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    color: '#DC2626',
  },
  moreHistoryText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
    color: '#A78BFA',
    opacity: 0.9,
    backgroundColor: '#4B5563',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  coinBalanceContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 10,
     marginBottom: 20,
     paddingVertical: 12,
     paddingHorizontal: 20,
     backgroundColor: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
     borderRadius: 16,
     borderWidth: 2,
     borderColor: 'rgba(251, 191, 36, 0.3)',
     shadowColor: '#F59E0B',
     shadowOffset: { width: 0, height: 3 },
     shadowOpacity: 0.2,
     shadowRadius: 8,
     elevation: 6,
   },
   coinBalanceText: {
     fontSize: typography.sizes.lg,
     fontFamily: typography.fonts.bold,
     fontWeight: typography.weights.bold,
     color: '#D97706',
   },
   bidCostText: {
     fontSize: typography.sizes.sm,
     fontFamily: typography.fonts.medium,
     color: '#92400E',
     opacity: 0.8,
   },
});