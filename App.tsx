import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import SplashScreenComponent from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import MainNavigator from './src/navigation/MainNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';
import VodafonePaymentScreen from './src/screens/VodafonePaymentScreen';
import { getUserRole } from './src/utils/storage';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

const Stack = createNativeStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>('Splash');

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
          'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
          'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
          'OleoScript-Regular': require('./assets/fonts/OleoScript-Regular.ttf'),
          'OleoScript-Bold': require('./assets/fonts/OleoScript-Bold.ttf'),
        });

        // Always show splash screen first for branding
        setInitialRoute('Splash');
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppContent onLayoutRootView={onLayoutRootView} />
    </ThemeProvider>
  );
}

function AppContent({ onLayoutRootView }: { onLayoutRootView: () => void }) {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          >
            <Stack.Screen 
              name="Splash" 
              component={SplashScreenComponent}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="UserMain" component={MainNavigator} />
            <Stack.Screen name="AdminMain" component={AdminNavigator} />
            <Stack.Screen 
              name="VodafonePayment" 
              component={VodafonePaymentScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </View>
  );
}
