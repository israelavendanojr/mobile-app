// components/ProtectedRoute.tsx
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { authState } = useAuth();

  // Show loading while checking auth
  if (authState?.authenticated === null) {
    return fallback || (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  // Redirect if not authenticated
  if (!authState?.authenticated) {
    return <Redirect href={redirectTo} />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}