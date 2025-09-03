import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { typography } from '../styles/typography';
import { getUserRole, getUserCoins, clearUserData, getCurrentUser } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

// Responsive constants
const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;
const isLargeScreen = width >= 1024;

const getResponsiveSize = (small: number, medium: number, tablet: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  if (isTablet) return tablet;
  return large;
};

interface HeaderProps {
  title?: string;
  showCoins?: boolean;
  showLogout?: boolean;
}

export default function Header({ title, showCoins = true, showLogout = true }: HeaderProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(0);

  // Create styles with theme colors
  const styles = StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: getResponsiveSize(45, 50, 55, 60),
      paddingBottom: getResponsiveSize(14, 18, 22, 26),
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      maxWidth: isLargeScreen ? 1200 : undefined,
      alignSelf: isLargeScreen ? 'center' : 'stretch',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: getResponsiveSize(16, 20, 24, 32),
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    title: {
      fontSize: (typography.sizes['2xl'] + 2) * getResponsiveSize(0.9, 1, 1.1, 1.2),
      fontFamily: typography.fonts.oleoBold,
      color: colors.primary,
      fontWeight: typography.weights.bold,
      letterSpacing: 0.5,
      marginLeft: 12,
      textShadowColor: 'rgba(255, 215, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    adminIcon: {
      marginLeft: 12,
    },
    rightContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeToggleContainer: {
      marginHorizontal: 8,
    },
    coinsContainer: {
      marginRight: 12,
      borderRadius: 25,
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    coinsGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    coinsText: {
      marginLeft: 8,
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: '#000',
      letterSpacing: 0.5,
    },
    logoutButton: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    logoutGradient: {
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const coinsScaleAnim = useRef(new Animated.Value(1)).current;
  const trophyPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserData();
    
    // Start animations
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

    // Trophy pulse animation - gentle breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyPulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(trophyPulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Refresh coin balance when any screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    const role = await getUserRole();
    const userCoins = await getUserCoins();
    setUserRole(role);
    setCoins(userCoins);

    // Animate coins when they change
    if (userCoins > 0) {
      Animated.sequence([
        Animated.timing(coinsScaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(coinsScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearUserData();
            (navigation as any).reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  // No interpolation needed for simple scale animation

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Enhanced Logo/Title */}
        <Animated.View style={styles.logoContainer}>
          <Animated.View
            style={{
              transform: [{ scale: trophyPulseAnim }],
            }}
          >
            <Ionicons name="trophy" size={28} color={colors.primary} />
          </Animated.View>
          <Text style={styles.title}>
            {title || 'WinZO'}
          </Text>
          {userRole === 'admin' && (
            <Animated.View
              style={{
                transform: [{ scale: coinsScaleAnim }],
              }}
            >
              <Ionicons name="shield" size={22} color={colors.primary} style={styles.adminIcon} />
            </Animated.View>
          )}
        </Animated.View>

        {/* Enhanced Right side content */}
        <Animated.View style={styles.rightContent}>
          {/* Enhanced Coins display for users */}
          {showCoins && userRole === 'user' && (
            <Animated.View 
              style={[
                styles.coinsContainer,
                {
                  transform: [{ scale: coinsScaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={[colors.warning, '#FFB300']}
                style={styles.coinsGradient}
              >
                <Ionicons name="diamond" size={18} color="#000" />
                <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
              </LinearGradient>
            </Animated.View>
          )}



          {/* Enhanced Logout button */}
          {showLogout && (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LinearGradient
                colors={[colors.surface, colors.card]}
                style={styles.logoutGradient}
              >
                <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}


