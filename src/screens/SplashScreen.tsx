import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import { getUserRole } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // Start complex animation sequence
    const animationSequence = Animated.sequence([
      // Initial fade and scale in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Trophy rotation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Shimmer effect
      Animated.timing(shimmerAnim, {
        toValue: width,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    // Pulse animation
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

    animationSequence.start();
    pulseAnimation.start();

    // Navigation timer
    const timer = setTimeout(async () => {
      const userRole = await getUserRole();
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      if (userRole === 'admin') {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'AdminMain' }],
        });
      } else if (userRole === 'user') {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'UserMain' }],
        });
      } else if (!hasSeenOnboarding) {
        // First time user - show onboarding
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      } else {
        // Returning user - go to auth
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    }, 3500);

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, [navigation]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={[colors.background, colors.surface, colors.background]}
      style={styles.gradientBackground}
    >
      {/* Background particles/stars */}
      <View style={styles.backgroundElements}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Animated Trophy Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: rotateInterpolate },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.gradientEnd, colors.primary]}
              style={styles.iconGradient}
            >
              <Ionicons name="trophy" size={100} color="#000" />
            </LinearGradient>
          </Animated.View>

          {/* App Name with Shimmer */}
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>WinZO</Text>
            
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerAnim }],
                },
              ]}
            />
          </View>

          {/* Enhanced Tagline */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.tagline}>The Pharaoh's Fortune Awaits</Text>
            <Text style={styles.subtitle}>Experience the Ultimate Gaming Adventure</Text>
          </Animated.View>

          {/* Loading indicator */}
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.loadingBar}>
              <Animated.View
                style={[
                  styles.loadingFill,
                  {
                    transform: [{ translateX: shimmerAnim }],
                  },
                ]}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGradient: {
    borderRadius: 60,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    position: 'relative',
    marginBottom: 24,
    overflow: 'hidden',
  },
  title: {
    fontSize: typography.sizes['5xl'] + 8,
    fontFamily: typography.fonts.oleoBold,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: typography.weights.bold,
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 100,
  },
  tagline: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.oleo,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.medium,
    color: '#CCCCCC',
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    width: 100,
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
});
