import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AuctionsScreen from '../screens/AuctionsScreen';
import MyBidsScreen from '../screens/MyBidsScreen';
import CoinStoreScreen from '../screens/CoinStoreScreen';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Auctions') {
            iconName = focused ? 'hammer' : 'hammer-outline';
          } else if (route.name === 'MyBids') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'CoinStore') {
            iconName = focused ? 'diamond' : 'diamond-outline';
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
        name="Auctions" 
        component={AuctionsScreen}
        options={{ tabBarLabel: 'Auctions' }}
      />
      <Tab.Screen 
        name="MyBids" 
        component={MyBidsScreen}
        options={{ tabBarLabel: 'My Bids' }}
      />
      <Tab.Screen 
        name="CoinStore" 
        component={CoinStoreScreen}
        options={{ tabBarLabel: 'Coin Store' }}
      />
    </Tab.Navigator>
  );
}
