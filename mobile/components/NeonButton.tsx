import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Theme } from '../constants/Theme';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function NeonButton({ title, onPress, style, textStyle, variant = 'primary', disabled }: NeonButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return [Theme.colors.secondary, '#7C4DFF'];
      case 'danger':
        return [Theme.colors.danger, '#D50000'];
      case 'primary':
      default:
        return [Theme.colors.primary, '#00B8D4'];
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed ? 0.95 : 1) }],
    opacity: withSpring(disabled ? 0.5 : 1),
  }));

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[styles.container, style, buttonStyle]}>
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.borderRadius.sm,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  pressable: {
    borderRadius: Theme.borderRadius.sm,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
