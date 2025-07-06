import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { onLogin, authState } = useAuth();

  // Redirect if already authenticated
  if (authState?.authenticated) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    const result = await onLogin(email, password);
    if (result?.success) {
      router.replace('/');
    } else {
      Alert.alert('Login Failed', result?.error || 'Please try again');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Login</Text>
      <TextInput
        className="border border-gray-300 p-2 mb-4 w-full rounded"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="border border-gray-300 p-2 mb-4 w-full rounded"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button 
        title="Don't have an account? Register" 
        onPress={() => router.push('/register')} 
      />
    </View>
  );
}