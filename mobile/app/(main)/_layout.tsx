import { Stack } from 'expo-router';
import { Theme } from '../../constants/Theme';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Theme.colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="task-modal" 
        options={{ 
          presentation: 'modal',
          contentStyle: { backgroundColor: 'transparent' }
        }} 
      />
    </Stack>
  );
}
