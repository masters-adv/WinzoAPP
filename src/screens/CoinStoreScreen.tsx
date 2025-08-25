import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { CoinPackage } from '../types';
import { fetchCoinPackages } from '../utils/api';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

interface CoinPackageCardProps {
  package: CoinPackage;
  onPress: (pkg: CoinPackage) => void;
  index: number;
}

const CoinPackageCard: React.FC<CoinPackageCardProps> = ({ package: pkg, onPress, index }) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const styles = StyleSheet.create({
    packageCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      margin: 8,
      borderWidth: pkg.popular ? 3 : 1,
      borderColor: pkg.popular ? colors.primary : colors.border,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: pkg.popular ? 0.25 : 0.15,
      shadowRadius: pkg.popular ? 12 : 8,
      elevation: pkg.popular ? 8 : 4,
      position: 'relative',
      overflow: 'hidden',
    },
    popularBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      transform: [{ rotate: '12deg' }],
    },
    popularBadgeText: {
      color: colors.buttonText,
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    packageHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    packageName: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    packageDescription: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    coinContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    coinAmount: {
      fontSize: typography.sizes['4xl'],
      fontFamily: typography.fonts.oleoBold,
      color: colors.primary,
      textAlign: 'center',
      textShadowColor: 'rgba(255, 215, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    coinLabel: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.medium,
      color: colors.textMuted,
      textAlign: 'center',
    },
    bonusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.success + '20',
    },
    bonusText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
      color: colors.success,
      marginLeft: 4,
    },
    priceContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    originalPrice: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.textMuted,
      textDecorationLine: 'line-through',
      marginBottom: 4,
    },
    currentPrice: {
      fontSize: typography.sizes['2xl'],
      fontFamily: typography.fonts.bold,
      color: colors.text,
    },
    currency: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
    },
    buyButton: {
      borderRadius: 16,
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
    buyButtonGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buyButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
      letterSpacing: 0.5,
    },
  });

  useEffect(() => {
    const animationDelay = index * 150;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress(pkg);
    });
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { translateY: slideAnim },
        ],
      }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.packageCard}>
          {pkg.popular && (
            <LinearGradient
              colors={[colors.primary, colors.gradientEnd]}
              style={styles.popularBadge}
            >
              <Text style={styles.popularBadgeText}>Most Popular</Text>
            </LinearGradient>
          )}
          
          <View style={styles.packageHeader}>
            <Text style={styles.packageName}>{pkg.name}</Text>
            {pkg.description && (
              <Text style={styles.packageDescription}>{pkg.description}</Text>
            )}
          </View>

          <View style={styles.coinContainer}>
            <Text style={styles.coinAmount}>{pkg.coins.toLocaleString()}</Text>
            <Text style={styles.coinLabel}>Coins</Text>
            
            {pkg.bonus && pkg.bonus > 0 && (
              <View style={styles.bonusContainer}>
                <Ionicons name="add-circle" size={16} color={colors.success} />
                <Text style={styles.bonusText}>+{pkg.bonus} Bonus Coins!</Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
              <Text style={styles.originalPrice}>{pkg.originalPrice} EGP</Text>
            )}
            <Text style={styles.currentPrice}>
              {pkg.price} <Text style={styles.currency}>EGP</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.buyButton} onPress={handlePress}>
            <LinearGradient
              colors={pkg.popular ? [colors.primary, colors.gradientEnd] : [colors.gradientStart, colors.gradientEnd]}
              style={styles.buyButtonGradient}
            >
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CoinStoreScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

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
    packagesContainer: {
      paddingHorizontal: 16,
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    errorText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
    },
    exchangeInfo: {
      marginHorizontal: 24,
      marginBottom: 20,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.info,
    },
    exchangeTitle: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 4,
    },
    exchangeText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });

  useEffect(() => {
    loadPackages();
    
    // Header animation
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await fetchCoinPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  };

  const handlePackagePress = (pkg: CoinPackage) => {
    navigation.navigate('VodafonePayment' as never, { package: pkg } as never);
  };

  if (loading && packages.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading coin packages...</Text>
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
        <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
          <Text style={styles.title}>Coin Store</Text>
          <Text style={styles.subtitle}>
            Buy coins to participate in auctions and win amazing prizes!
          </Text>
        </Animated.View>

        <View style={styles.exchangeInfo}>
          <Text style={styles.exchangeTitle}>💰 Exchange Rate</Text>
          <Text style={styles.exchangeText}>
            1 Coin = 1 EGP • Secure payments via Vodafone Cash
          </Text>
        </View>

        <View style={styles.packagesContainer}>
          {packages.map((pkg, index) => (
            <CoinPackageCard
              key={pkg.id}
              package={pkg}
              onPress={handlePackagePress}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
