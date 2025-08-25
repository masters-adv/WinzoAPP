import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { typography } from '../styles/typography';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const getOnboardingData = (colors: any): OnboardingSlide[] => [
  {
    id: '1',
    title: 'Welcome to WinZO',
    description: 'Experience the ultimate auction platform where every bid counts and every win feels like treasure.',
    icon: 'trophy',
    color: colors.primary,
  },
  {
    id: '2',
    title: 'Lowest Bid Wins',
    description: 'Unlike traditional auctions, here the LOWEST unique bid wins! Strategy and timing are everything.',
    icon: 'trending-down',
    color: colors.success,
  },
  {
    id: '3',
    title: 'Premium Products',
    description: 'Bid on exclusive items, electronics, and luxury goods at incredible prices.',
    icon: 'diamond',
    color: colors.warning,
  },
  {
    id: '4',
    title: 'Real-Time Competition',
    description: 'Watch live updates, track your position, and strategize your next bid in real-time.',
    icon: 'flash',
    color: colors.info,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onboardingData = getOnboardingData(colors);

  useEffect(() => {
    // Update progress animation
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / onboardingData.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, colors]);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flatListRef.current?.scrollToIndex({ 
        index: currentIndex + 1, 
        animated: true 
      });
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flatListRef.current?.scrollToIndex({ 
        index: currentIndex - 1, 
        animated: true 
      });
    }
  };

  const handleGetStarted = async () => {
    // Mark that user has seen onboarding
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isActive = index === currentIndex;
    
    return (
      <View style={styles.slide}>
        <Animated.View
          style={[
            styles.slideContent,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <LinearGradient
              colors={[item.color, item.color + '80']}
              style={styles.iconGradient}
            >
              <Ionicons name={item.icon} size={80} color="#000" />
            </LinearGradient>
          </View>

          {/* Content */}
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderDot = (index: number) => {
    const isActive = index === currentIndex;
    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            backgroundColor: isActive ? colors.primary : colors.textMuted,
            transform: [
              {
                scale: isActive ? 1.2 : 1,
              },
            ],
          },
        ]}
      />
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a', '#2a2a2a']}
      style={styles.container}
    >
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => renderDot(index))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
                     {currentIndex > 0 && (
             <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
               <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
               <Text style={[styles.previousText, { color: colors.textSecondary }]}>Previous</Text>
             </TouchableOpacity>
           )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons 
                name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'chevron-forward'} 
                size={20} 
                color="#000" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.medium,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.oleoBold,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  description: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 300,
  },
  bottomNavigation: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  previousText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.medium,
    marginLeft: 4,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    color: '#000',
    marginRight: 8,
  },
});
