import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { onRegister, authState } = useAuth();

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

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const result = await onRegister(email, password);
    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Register</Text>
      <TextInput
        className="border border-gray-300 p-2 mb-4 w-full rounded"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
      <TextInput
        className="border border-gray-300 p-2 mb-4 w-full rounded"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!authState.loading}
      />
      
      {authState.loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button title="Register" onPress={handleRegister} />
          <Button 
            title="Already have an account? Login" 
            onPress={() => router.push('/login')} 
          />
        </>
      )}
    </View>
  );
}