// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import '@/global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false, 
            title: 'Home' 
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            // Prevent going back to protected screens
            gestureEnabled: false
          }} 
        />
        {/* Add other screens here */}
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: 'Profile' 
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}