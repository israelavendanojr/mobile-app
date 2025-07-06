import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

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

  // Show loading while checking auth or during token refresh
  if (authState.loading || authState.authenticated === null) {
    return fallback || (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  // Redirect if not authenticated
  if (!authState.authenticated) {
    return <Redirect href={redirectTo} />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}