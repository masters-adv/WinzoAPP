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
  endDate?: Date;
  endTime?: string | Date;
  style?: object;
  compact?: boolean;
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

export default function CountdownTimer({ endDate, endTime, style, compact = false }: CountdownTimerProps) {
  const { colors } = useTheme();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Determine the target date
  const targetDate = endDate || (endTime ? new Date(endTime) : null);

  useEffect(() => {
    if (!targetDate) return;
    
    setIsMounted(true);
    // Set initial time left
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate?.getTime()]);

  if (!isMounted) {
    return null; // Don't render during initial mount
  }

  if (!targetDate || !timeLeft) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.endedText, { color: colors.error }]}>Auction Ended</Text>
      </View>
    );
  }

  if (compact) {
    // Compact format for auction cards
    const totalHours = timeLeft.days * 24 + timeLeft.hours;
    if (totalHours > 0) {
      return (
        <Text style={[styles.compactTimer, style, { color: colors.error }]}>
          {totalHours}h {String(timeLeft.minutes).padStart(2, '0')}m
        </Text>
      );
    } else {
      return (
        <Text style={[styles.compactTimer, style, { color: colors.error }]}>
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </Text>
      );
    }
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  timeValue: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 50,
  },
  timeNumber: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.bold,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.xl * 1.2,
  },
  timeLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    fontWeight: typography.weights.medium,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  endedText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bold,
    textAlign: 'center',
  },
  compactTimer: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    fontWeight: typography.weights.medium,
  },
});
