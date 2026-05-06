import React from 'react';
import { StyleSheet, View, Platform, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/Theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GlassCard({ children, style }: GlassCardProps) {
  // BlurView doesn't work on web. Use a native View with matching styles instead.
  const Inner = Platform.OS === 'web' ? View : View;

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <Inner style={[styles.inner, Platform.OS === 'web' && styles.innerWeb]}>
        {children}
      </Inner>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    overflow: 'hidden',
  },
  inner: {
    padding: Theme.spacing.md,
  },
  // @ts-ignore - backdropFilter is web-only
  innerWeb: {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
});
