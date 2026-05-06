import { Platform } from 'react-native';

// Resolve API URL based on platform and environment
const getApiUrl = () => {
  // When running in a web browser, always use localhost directly
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // For native builds, use env variable (physical device needs local IP)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Android Emulator needs 10.0.2.2 to hit the host machine's localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();
