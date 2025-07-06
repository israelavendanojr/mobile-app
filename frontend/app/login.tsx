import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

export default function Login() {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const { onLogin, authState } = useAuth();

  // Show loading while checking initial auth state
  if (authState.loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  // Redirect if already authenticated
  if (authState.authenticated) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    if (!loginInput || !password) {
      Alert.alert('Error', 'Please enter both email/username and password');
      return;
    }

    const result = await onLogin(loginInput, password);
    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Login Failed', result.error || 'Please try again');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Login</Text>
      <TextInput
        className="border border-gray-300 p-2 mb-4 w-full rounded"
        placeholder="Email or Username"
        value={loginInput}
        onChangeText={setLoginInput}
        autoCapitalize="none"
        editable={!authState.loading}
      />
      <TextInput
        className="border border-gray-300 p-2 mb-4 w-full rounded"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!authState.loading}
      />
      
      {authState.loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button title="Login" onPress={handleLogin} />
          <Button 
            title="Don't have an account? Register" 
            onPress={() => router.push('/register')} 
          />
        </>
      )}
    </View>
  );
}