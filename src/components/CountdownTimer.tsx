import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { typography } from '../styles/typography';
import { useTheme } from '../contexts/ThemeContext';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  endDate: Date;
  style?: object;
}

const calculateTimeLeft = (endDate: Date): TimeLeft | null => {
  const difference = +endDate - +new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return null;
};

const TimeValue = ({ value, label, colors }: { value: number; label: string; colors: any }) => (
  <View style={styles.timeValue}>
    <Text style={[styles.timeNumber, { color: colors.primary }]}>
      {String(value).padStart(2, '0')}
    </Text>
    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>{label}</Text>
  </View>
);

export default function CountdownTimer({ endDate, style }: CountdownTimerProps) {
  const { colors } = useTheme();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Set initial time left
    setTimeLeft(calculateTimeLeft(endDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!isMounted) {
    return null; // Don't render during initial mount
  }

  if (!timeLeft) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.endedText, { color: colors.error }]}>Auction Ended</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.timeContainer}>
        <TimeValue value={timeLeft.days} label="Days" colors={colors} />
        <TimeValue value={timeLeft.hours} label="Hours" colors={colors} />
        <TimeValue value={timeLeft.minutes} label="Mins" colors={colors} />
        <TimeValue value={timeLeft.seconds} label="Secs" colors={colors} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeValue: {
    alignItems: 'center',
    flex: 1,
  },
  timeNumber: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
  },
  timeLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.regular,
    marginTop: 2,
  },
  endedText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    textAlign: 'center',
  },
});
