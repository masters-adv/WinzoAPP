import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';

import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { CoinPackage, CoinTransaction, VodafoneCashPayment } from '../types';
import { 
  fetchPaymentMethods, 
  createCoinTransaction, 
  submitVodafonePayment 
} from '../utils/api';
import { 
  getUserId, 
  storePendingTransaction 
} from '../utils/storage';
import Header from '../components/Header';

interface RouteParams {
  package: CoinPackage;
}

export default function VodafonePaymentScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { package: selectedPackage } = route.params as RouteParams;

  const [loading, setLoading] = useState(false);
  const [vodafoneNumbers, setVodafoneNumbers] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [transaction, setTransaction] = useState<CoinTransaction | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const stepProgressAnim = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardContainer: {
      flex: 1,
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
      fontSize: typography.sizes['3xl'],
      fontFamily: typography.fonts.oleoBold,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 30,
    },
    progressStep: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
    },
    progressStepActive: {
      backgroundColor: colors.primary,
    },
    progressStepInactive: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    progressStepText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
    },
    progressStepTextInactive: {
      color: colors.textMuted,
    },
    progressLine: {
      height: 2,
      flex: 1,
      backgroundColor: colors.border,
      marginHorizontal: 8,
    },
    progressLineActive: {
      backgroundColor: colors.primary,
    },
    packageSummary: {
      marginHorizontal: 24,
      marginBottom: 30,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    packageTitle: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 8,
    },
    packageDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    packageDetailText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
    },
    packageDetailValue: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.text,
    },
    totalAmount: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fonts.bold,
      color: colors.primary,
      textAlign: 'right',
    },
    stepContainer: {
      marginHorizontal: 24,
      marginBottom: 30,
    },
    stepTitle: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 16,
    },
    instructionsList: {
      marginBottom: 20,
    },
    instructionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    instructionNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    instructionNumberText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
    },
    instructionText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.text,
      lineHeight: 20,
    },
    vodafoneNumbersContainer: {
      marginBottom: 20,
    },
    vodafoneNumberLabel: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 12,
    },
    vodafoneNumberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 2,
    },
    vodafoneNumberSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    vodafoneNumberUnselected: {
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    vodafoneNumberText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.text,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    copyButtonText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
      color: colors.primary,
      marginLeft: 4,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    referenceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 20,
    },
    referenceText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.text,
    },
    referenceValue: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fonts.bold,
      color: colors.primary,
    },
    nextButton: {
      marginHorizontal: 24,
      marginBottom: 20,
      borderRadius: 12,
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
    nextButtonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.buttonText,
      letterSpacing: 0.5,
    },
    backButton: {
      marginHorizontal: 24,
      marginBottom: 20,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
    },
    successContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    successTitle: {
      fontSize: typography.sizes['2xl'],
      fontFamily: typography.fonts.bold,
      color: colors.success,
      textAlign: 'center',
      marginBottom: 12,
    },
    successMessage: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 30,
    },
    screenshotContainer: {
      marginBottom: 20,
    },
    screenshotLabel: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.bold,
      color: colors.text,
      marginBottom: 12,
    },
    screenshotUploadArea: {
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      minHeight: 120,
    },
    screenshotUploadAreaActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    screenshotPreview: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
    },
    screenshotActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    screenshotButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    screenshotButtonText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: colors.primary,
      marginLeft: 8,
    },
    removeScreenshotButton: {
      backgroundColor: colors.error + '20',
    },
    removeScreenshotText: {
      color: colors.error,
    },
    screenshotFileName: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.regular,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
    },
    screenshotUploadIcon: {
      marginBottom: 8,
    },
    screenshotUploadText: {
      fontSize: typography.sizes.base,
      fontFamily: typography.fonts.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 4,
    },
    screenshotUploadSubtext: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });

  useEffect(() => {
    loadPaymentMethods();
    generateReferenceNumber();
    
    // Initial animations
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
  }, []);

  useEffect(() => {
    // Update progress animation
    Animated.timing(stepProgressAnim, {
      toValue: (currentStep - 1) / 2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await fetchPaymentMethods();
      const vodafoneMethod = methods.find(m => m.type === 'vodafone_cash');
      if (vodafoneMethod && vodafoneMethod.accountNumbers) {
        setVodafoneNumbers(vodafoneMethod.accountNumbers);
        setSelectedNumber(vodafoneMethod.accountNumbers[0]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    }
  };

  const generateReferenceNumber = () => {
    const ref = `WZ${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setReferenceNumber(ref);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Toast.show({
        type: 'success',
        text1: 'Copied!',
        text2: `${label} copied to clipboard`,
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take payment screenshots.');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed to select payment screenshots.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPaymentScreenshot(asset.base64 || asset.uri);
        setScreenshotFileName(`payment_${Date.now()}.jpg`);
        
        Toast.show({
          type: 'success',
          text1: 'Screenshot Captured!',
          text2: 'Payment screenshot added successfully',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture screenshot');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPaymentScreenshot(asset.base64 || asset.uri);
        setScreenshotFileName(asset.fileName || `payment_${Date.now()}.jpg`);
        
        Toast.show({
          type: 'success',
          text1: 'Screenshot Selected!',
          text2: 'Payment screenshot added successfully',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select screenshot');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Payment Screenshot',
      'Choose how to add your payment confirmation screenshot',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
      ]
    );
  };

  const removeScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotFileName(null);
    
    Toast.show({
      type: 'info',
      text1: 'Screenshot Removed',
      text2: 'Payment screenshot has been removed',
      visibilityTime: 2000,
    });
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!selectedNumber) {
        Alert.alert('Error', 'Please select a Vodafone Cash number');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!senderNumber.trim()) {
        Alert.alert('Error', 'Please enter your Vodafone number');
        return;
      }
      
      if (senderNumber.length !== 11 || !senderNumber.startsWith('01')) {
        Alert.alert('Error', 'Please enter a valid Egyptian mobile number (11 digits starting with 01)');
        return;
      }

      if (!paymentScreenshot) {
        Alert.alert('Error', 'Please upload a payment confirmation screenshot');
        return;
      }

      await submitPayment();
    }
  };

  const submitPayment = async () => {
    try {
      setLoading(true);
      
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }

      // Create transaction
      const transactionData = {
        userId,
        packageId: selectedPackage.id,
        amount: selectedPackage.price,
        coins: selectedPackage.coins + (selectedPackage.bonus || 0),
        paymentMethod: 'vodafone_cash',
        paymentReference: referenceNumber,
        status: 'pending' as const,
      };

      const newTransaction = await createCoinTransaction(transactionData);
      
      // Submit Vodafone payment details
      const paymentData: VodafoneCashPayment = {
        senderNumber,
        receiverNumber: selectedNumber,
        amount: selectedPackage.price,
        reference: referenceNumber,
        paymentScreenshot,
        screenshotFileName,
      };

      const updatedTransaction = await submitVodafonePayment(paymentData, newTransaction.id);
      
      // Store locally for tracking
      await storePendingTransaction(updatedTransaction);
      
      setTransaction(updatedTransaction);
      setCurrentStep(3);
      
      Toast.show({
        type: 'success',
        text1: 'Payment Submitted!',
        text2: 'Your payment is being processed',
        visibilityTime: 3000,
      });
      
    } catch (error) {
      console.error('Error submitting payment:', error);
      Alert.alert('Error', 'Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoHome = () => {
    navigation.navigate('UserMain' as never);
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressStep, currentStep >= 1 ? styles.progressStepActive : styles.progressStepInactive]}>
        <Text style={[styles.progressStepText, currentStep < 1 && styles.progressStepTextInactive]}>1</Text>
      </View>
      <View style={[styles.progressLine, currentStep > 1 && styles.progressLineActive]} />
      <View style={[styles.progressStep, currentStep >= 2 ? styles.progressStepActive : styles.progressStepInactive]}>
        <Text style={[styles.progressStepText, currentStep < 2 && styles.progressStepTextInactive]}>2</Text>
      </View>
      <View style={[styles.progressLine, currentStep > 2 && styles.progressLineActive]} />
      <View style={[styles.progressStep, currentStep >= 3 ? styles.progressStepActive : styles.progressStepInactive]}>
        <Ionicons name="checkmark" size={20} color={currentStep >= 3 ? colors.buttonText : colors.textMuted} />
      </View>
    </View>
  );

  const renderPackageSummary = () => (
    <LinearGradient
      colors={[colors.card, colors.surface]}
      style={styles.packageSummary}
    >
      <Text style={styles.packageTitle}>{selectedPackage.name}</Text>
      <View style={styles.packageDetails}>
        <Text style={styles.packageDetailText}>Coins:</Text>
        <Text style={styles.packageDetailValue}>{selectedPackage.coins.toLocaleString()}</Text>
      </View>
      {selectedPackage.bonus && selectedPackage.bonus > 0 && (
        <View style={styles.packageDetails}>
          <Text style={styles.packageDetailText}>Bonus Coins:</Text>
          <Text style={styles.packageDetailValue}>+{selectedPackage.bonus.toLocaleString()}</Text>
        </View>
      )}
      <View style={[styles.packageDetails, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 8 }]}>
        <Text style={styles.packageDetailText}>Total Amount:</Text>
        <Text style={styles.totalAmount}>{selectedPackage.price} EGP</Text>
      </View>
    </LinearGradient>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Payment Instructions</Text>
      
      <View style={styles.instructionsList}>
        {[
          "Open your Vodafone Cash app",
          "Select 'Send Money'",
          "Enter the Vodafone Cash number below",
          "Enter the exact amount shown",
          "Add the reference number in the message",
          "Complete the payment",
          "Take a screenshot of the confirmation",
          "Continue to next step"
        ].map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>

      <View style={styles.vodafoneNumbersContainer}>
        <Text style={styles.vodafoneNumberLabel}>Select Vodafone Cash Number:</Text>
        {vodafoneNumbers.map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.vodafoneNumberCard,
              selectedNumber === number ? styles.vodafoneNumberSelected : styles.vodafoneNumberUnselected
            ]}
            onPress={() => setSelectedNumber(number)}
          >
            <Text style={styles.vodafoneNumberText}>{number}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(number, 'Number')}
            >
              <Ionicons name="copy" size={16} color={colors.primary} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.referenceContainer}>
        <Text style={styles.referenceText}>Reference Number:</Text>
        <TouchableOpacity onPress={() => copyToClipboard(referenceNumber, 'Reference')}>
          <Text style={styles.referenceValue}>{referenceNumber}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Confirm Payment</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Vodafone Number</Text>
        <TextInput
          style={styles.input}
          value={senderNumber}
          onChangeText={setSenderNumber}
          placeholder="01XXXXXXXXX"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={11}
          autoFocus
        />
      </View>

      <View style={styles.screenshotContainer}>
        <Text style={styles.screenshotLabel}>Payment Screenshot *</Text>
        
        {paymentScreenshot ? (
          <View>
            <Image
              source={{ 
                uri: paymentScreenshot.startsWith('data:') 
                  ? paymentScreenshot 
                  : `data:image/jpeg;base64,${paymentScreenshot}` 
              }}
              style={styles.screenshotPreview}
              resizeMode="contain"
            />
            <View style={styles.screenshotActions}>
              <TouchableOpacity
                style={styles.screenshotButton}
                onPress={showImagePickerOptions}
              >
                <Ionicons name="camera" size={16} color={colors.primary} />
                <Text style={styles.screenshotButtonText}>Change Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.screenshotButton, styles.removeScreenshotButton]}
                onPress={removeScreenshot}
              >
                <Ionicons name="trash" size={16} color={colors.error} />
                <Text style={[styles.screenshotButtonText, styles.removeScreenshotText]}>Remove</Text>
              </TouchableOpacity>
            </View>
            {screenshotFileName && (
              <Text style={styles.screenshotFileName}>{screenshotFileName}</Text>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.screenshotUploadArea]}
            onPress={showImagePickerOptions}
          >
            <Ionicons 
              name="camera" 
              size={40} 
              color={colors.textMuted} 
              style={styles.screenshotUploadIcon} 
            />
            <Text style={styles.screenshotUploadText}>Upload Payment Screenshot</Text>
            <Text style={styles.screenshotUploadSubtext}>
              Take a photo or choose from gallery
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Ionicons name="checkmark" size={14} color={colors.buttonText} />
          </View>
          <Text style={styles.instructionText}>
            I have sent {selectedPackage.price} EGP to {selectedNumber} with reference "{referenceNumber}"
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={50} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>Payment Submitted!</Text>
      <Text style={styles.successMessage}>
        Your payment has been submitted successfully. We will verify your transaction and add the coins to your account within 24 hours.
      </Text>
      <Text style={styles.successMessage}>
        Transaction ID: {transaction?.id}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Vodafone Cash Payment</Text>
              <Text style={styles.subtitle}>
                Complete your coin purchase securely
              </Text>
            </View>

            {renderProgressBar()}
            {renderPackageSummary()}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </Animated.View>
        </ScrollView>

        {currentStep < 3 && (
          <View>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.nextButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.nextButtonText}>
                    {currentStep === 1 ? 'Continue' : 'Submit Payment'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackStep}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {currentStep === 3 && (
          <TouchableOpacity style={styles.nextButton} onPress={handleGoHome}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>Go to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
