import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuctionsScreen from '../screens/AuctionsScreen';
import AuctionDetailScreen from '../screens/AuctionDetailScreen';
import AuctionDetailScreenTest from '../screens/AuctionDetailScreenTest';
import { Product } from '../types';

export type AuctionsStackParamList = {
  AuctionsList: undefined;
  AuctionDetail: {
    product: Product;
  };
};

const Stack = createNativeStackNavigator<AuctionsStackParamList>();

export default function AuctionsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen 
        name="AuctionsList" 
        component={AuctionsScreen}
      />
      <Stack.Screen 
        name="AuctionDetail" 
        component={AuctionDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}