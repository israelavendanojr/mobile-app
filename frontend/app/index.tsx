import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';

export default function Index() {
  const { onLogout } = useAuth();

  const handleLogout = async () => {
    await onLogout();
    router.replace('/auth/login');
  };

  return (
    <ProtectedRoute>
      <WelcomeScreen />
    </ProtectedRoute>
  );
}