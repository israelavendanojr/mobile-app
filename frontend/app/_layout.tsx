import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import '@/global.css';
import { OnboardingProvider } from '../context/OnboardingContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Stack />
      </OnboardingProvider>
    </AuthProvider>
  );
}