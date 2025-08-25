import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminProductsScreen from '../screens/AdminProductsScreen';
import AdminPaymentsScreen from '../screens/AdminPaymentsScreen';
import AdminStoreScreen from '../screens/AdminStoreScreen';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Store') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Roboto-Medium',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Products" 
        component={AdminProductsScreen}
        options={{ tabBarLabel: 'Products' }}
      />
      <Tab.Screen 
        name="Store" 
        component={AdminStoreScreen}
        options={{ tabBarLabel: 'Store' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={AdminPaymentsScreen}
        options={{ tabBarLabel: 'Payments' }}
      />
    </Tab.Navigator>
  );
}
