import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useTheme } from '../contexts/ThemeContext';
import { loginUser, signupUser } from '../utils/api';
import { storeUser, storeAuthToken } from '../utils/storage';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  
  // Button animation refs
  const loginButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const googleButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const signupButtonScaleAnim = useRef(new Animated.Value(1)).current;

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Create styles with theme colors
  const styles = StyleSheet.create({
    gradientBackground: {
      flex: 1,
    },
    keyboardContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: typography.sizes['4xl'] + 4,
      fontFamily: typography.fonts.oleoBold,
      color: colors.primary,
      fontWeight: typography.weights.bold,
      letterSpacing: 1,
      marginLeft: 16,
      textShadowColor: 'rgba(255, 215, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    welcomeText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    tabContainer: {
      marginBottom: 32,
      paddingHorizontal: 4,
    },
    tabBackground: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      position: 'relative',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    tabIndicator: {
      position: 'absolute',
      top: 4,
      left: 4,
      width: '48%',
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 8,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    tab: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 8,
      zIndex: 1,
    },
    tabText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: '#000',
      fontFamily: typography.fonts.bold,
    },
    formContainer: {
      flex: 1,
    },
    form: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 28,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: 'rgba(255, 215, 0, 0.05)',
    },
    formTitle: {
      fontSize: typography.sizes['2xl'] + 2,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    formDescription: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      marginBottom: 28,
      textAlign: 'center',
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.medium,
      color: colors.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.text,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      elevation: 1,
    },
    primaryButton: {
      paddingVertical: 18,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      marginBottom: 20,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    primaryButtonText: {
      fontSize: typography.sizes.base + 1,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
      letterSpacing: 0.5,
    },
    googleButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    googleButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.text,
    },
  });

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateTabChange = (tab: 'login' | 'signup') => {
    if (tab === activeTab) return;

    // Smoother tab transition with parallel animations
    Animated.parallel([
      Animated.timing(formFadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tabSlideAnim, {
        toValue: tab === 'login' ? 0 : 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tab);
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Button press animation functions
  const animateButtonPress = (scaleAnim: Animated.Value) => {
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
    ]).start();
  };

  const handleLogin = async () => {
    animateButtonPress(loginButtonScaleAnim);
    if (!loginEmail || !loginPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser({ email: loginEmail, password: loginPassword });
      await storeUser(user);
      
      if (user.role === 'admin') {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'AdminMain' }],
        });
      } else {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'UserMain' }],
        });
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    animateButtonPress(signupButtonScaleAnim);
    if (!signupName || !signupEmail || !signupPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await signupUser({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      await storeUser(user);
      
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'UserMain' }],
      });
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    animateButtonPress(googleButtonScaleAnim);
    setLoading(true);
    try {
      // Mock Google auth - login with test user
      const user = await loginUser({ email: 'user@winzo.com', password: 'password' });
      await storeUser(user);
      
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'UserMain' }],
      });
    } catch (error: any) {
      Alert.alert('Error', 'Could not log in with Google');
    } finally {
      setLoading(false);
    }
  };

  const tabIndicatorTranslate = tabSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.5 - 32],
  });

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a', '#2a2a2a']}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header with Animation */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Animated.View
                style={{
                  transform: [{ rotate: '10deg' }],
                }}
              >
                <Ionicons name="trophy" size={48} color={colors.primary} />
              </Animated.View>
              <Text style={styles.title}>WinZO</Text>
            </View>
            <Text style={styles.welcomeText}>Welcome to the Ultimate Gaming Experience</Text>
          </Animated.View>

          {/* Enhanced Tab Container with Slider */}
          <Animated.View
            style={[
              styles.tabContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.tabBackground}>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    transform: [{ translateX: tabIndicatorTranslate }],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.tab}
                onPress={() => animateTabChange('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => animateTabChange('signup')}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Enhanced Form Container with Animation */}
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: formFadeAnim,
              },
            ]}
          >
            {activeTab === 'login' ? (
              <View style={styles.form}>
            <Text style={styles.formTitle}>Login</Text>
            <Text style={styles.formDescription}>
              Enter your credentials to access your account.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="m@example.com"
                placeholderTextColor={colors.textMuted}
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={1}>
              <Animated.View
                style={{
                  transform: [{ scale: loginButtonScaleAnim }],
                }}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.buttonText} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Login</Text>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGoogleAuth} disabled={loading} activeOpacity={1}>
              <Animated.View
                style={{
                  transform: [{ scale: googleButtonScaleAnim }],
                }}
              >
                <View style={styles.googleButton}>
                  <Text style={styles.googleButtonText}>🔍 Sign in with Google</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Sign Up</Text>
            <Text style={styles.formDescription}>
              Create an account to start bidding on exclusive items.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={colors.textMuted}
                value={signupName}
                onChangeText={setSignupName}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="m@example.com"
                placeholderTextColor={colors.textMuted}
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={signupPassword}
                onChangeText={setSignupPassword}
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={1}>
              <Animated.View
                style={{
                  transform: [{ scale: signupButtonScaleAnim }],
                }}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.buttonText} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGoogleAuth} disabled={loading} activeOpacity={1}>
              <Animated.View
                style={{
                  transform: [{ scale: googleButtonScaleAnim }],
                }}
              >
                <View style={styles.googleButton}>
                  <Text style={styles.googleButtonText}>🔍 Sign up with Google</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


