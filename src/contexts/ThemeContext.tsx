import React, { createContext, useContext, ReactNode } from 'react';

// Simple, static theme - no switching, no async loading
const colors = {
  primary: '#FFD700',
  primaryDark: '#B8860B',
  primaryLight: '#FFECB3',
  background: '#000000',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#999999',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  border: '#333333',
  divider: '#444444',
  buttonPrimary: '#FFD700',
  buttonSecondary: '#333333',
  buttonText: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardOverlay: 'rgba(255, 215, 0, 0.1)',
  gradientStart: '#FFD700',
  gradientEnd: '#B8860B',
  gradientPurple: '#8B5CF6',
  gradientBlue: '#3B82F6',
  gradientGreen: '#10B981',
  gradientRed: '#EF4444',
  gradientOrange: '#F59E0B',
  neonGold: '#FFE55C',
  neonBlue: '#00D4FF',
  neonPurple: '#B794F6',
  neonGreen: '#68D391',
};

interface ThemeContextType {
  colors: typeof colors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors,
  isDark: true,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors, isDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
};