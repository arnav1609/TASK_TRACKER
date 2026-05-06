import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { Theme } from '../../constants/Theme';
import { GlassCard } from '../../components/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { API_URL } from '../../config/api';

export default function SignupScreen() {
  const router = useRouter();
  const setAuth = useStore((state) => state.setAuth);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      console.log('Signing up with API URL:', API_URL);
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      
      const data = await res.json();
      console.log('Signup response:', res.status, data);
      
      if (res.ok) {
        setAuth({ id: data.user.id, name: data.user.name, email: data.user.email }, data.token);
        router.replace('/(main)');
      } else {
        const message = data.errors ? data.errors[0].msg : (data.message || 'Signup failed');
        setError(message);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network request failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        entering={FadeInUp.duration(800)}
        style={styles.content}
      >
        <Text style={styles.headerTitle}>Join TaskFlow</Text>
        <Text style={styles.headerSubtitle}>Start achieving your goals</Text>

        <GlassCard style={styles.card}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'name' && styles.labelFocused]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Theme.colors.textMuted}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'email' && styles.labelFocused]}>
              Email Address
            </Text>
            <TextInput
              style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={Theme.colors.textMuted}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'password' && styles.labelFocused]}>
              Password
            </Text>
            <TextInput
              style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password (min 6 chars)"
              placeholderTextColor={Theme.colors.textMuted}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry
            />
          </View>
          
          <NeonButton 
            title={loading ? "Signing up..." : "Create Account"} 
            onPress={handleSignup} 
            style={styles.button}
            disabled={loading}
          />

          <Pressable onPress={() => router.back()} style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Log in</Text></Text>
          </Pressable>
        </GlassCard>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    color: Theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.xs,
  },
  headerSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    marginBottom: Theme.spacing.xl,
  },
  card: {
    padding: Theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    borderWidth: 1,
    borderColor: Theme.colors.danger,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginBottom: Theme.spacing.xs,
    fontWeight: '500',
  },
  labelFocused: {
    color: Theme.colors.primary,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderRadius: Theme.borderRadius.sm,
    color: Theme.colors.text,
    padding: Theme.spacing.md,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  button: {
    marginTop: Theme.spacing.md,
  },
  linkContainer: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  linkTextBold: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
});
