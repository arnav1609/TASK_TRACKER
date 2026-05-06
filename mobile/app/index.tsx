import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { Theme } from '../constants/Theme';
import { CheckCircle } from 'lucide-react-native';

export default function SplashScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(main)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(1000)}
        style={styles.logoContainer}
      >
        <CheckCircle color={Theme.colors.primary} size={80} />
      </Animated.View>
      <Animated.Text
        entering={FadeInUp.duration(800).delay(200)}
        style={styles.title}
      >
        TaskFlow
      </Animated.Text>
      <Animated.Text
        entering={FadeInUp.duration(800).delay(400)}
        style={styles.tagline}
      >
        Focus on what matters
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: Theme.spacing.lg,
    letterSpacing: 1,
  },
  tagline: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    marginTop: Theme.spacing.sm,
  },
});
