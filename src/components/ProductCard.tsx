import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Product, Bid } from '../types';
import { typography } from '../styles/typography';
import CountdownTimer from './CountdownTimer';
import { useTheme } from '../contexts/ThemeContext';
import Badge from './Badge';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 48 = padding + gap

interface ProductCardProps {
  product: Product | Bid;
  onPress?: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const { colors } = useTheme();
  const isBid = 'status' in product;
  const endDate = typeof product.endTime === 'string' ? new Date(product.endTime) : product.endTime;

  // Create styles with theme colors
  const styles = StyleSheet.create({
    container: {
      width: cardWidth,
      marginBottom: 16,
    },
    touchable: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
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
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: cardWidth * 0.8,
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
    },
    badgeContainer: {
      position: 'absolute',
      top: 12,
      right: 12,
    },
    content: {
      padding: 16,
    },
    productName: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 10,
      lineHeight: 22,
    },
    bidInfo: {
      marginTop: 12,
    },
    bidLabel: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.medium,
      color: colors.textMuted,
      marginBottom: 6,
    },
    bidAmountGradient: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    bidAmount: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: '#000',
    },
    bidder: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.regular,
      color: colors.textMuted,
      marginTop: 2,
    },
    userBidInfo: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    userBidLabel: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.medium,
      color: colors.textMuted,
      marginBottom: 4,
    },
    userBidAmount: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.primary,
      textShadowColor: 'rgba(255, 215, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    bidButton: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    bidButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
      letterSpacing: 0.5,
    },
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smoother entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    // Smoother button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.95}
        style={styles.touchable}
      >
        <View style={styles.card}>
          {/* Enhanced Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
            />
            
            {/* Image Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            
            {/* Status Badge for Bids */}
            {isBid && (
              <Animated.View 
                style={[
                  styles.badgeContainer,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Badge
                  text={product.status}
                  variant={product.status === 'Lowest Bidder' ? 'success' : 'error'}
                />
              </Animated.View>
            )}
          </View>

          {/* Enhanced Content */}
          <View style={styles.content}>
            {/* Product Name */}
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>

            {/* Countdown Timer */}
            <CountdownTimer endDate={endDate} />

            {/* Enhanced Bid Information */}
            <View style={styles.bidInfo}>
              <Text style={styles.bidLabel}>Current Lowest Bid:</Text>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bidAmountGradient}
              >
                <Text style={styles.bidAmount}>
                  ${product.lowestBid.toFixed(2)}
                </Text>
              </LinearGradient>
              <Text style={styles.bidder}>by {product.lowestBidder}</Text>
            </View>

            {/* User's Bid (if this is a bid) */}
            {isBid && (
              <View style={styles.userBidInfo}>
                <Text style={styles.userBidLabel}>Your Bid:</Text>
                <Text style={styles.userBidAmount}>
                  ${(product as Bid).userBid.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Enhanced Bid Button */}
          <Animated.View
            style={{
              transform: [{ scale: buttonScaleAnim }],
            }}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bidButton}
            >
              <Text style={styles.bidButtonText}>Bid Now</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}


