import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    const result = await onRegister(email, password, username);
    if (result.success) {
      router.replace('/');
    } else {
      // Handle different types of errors
      if (result.errors) {
        // Field-specific errors from backend
        setErrors(result.errors);
      } else if (result.error) {
        // General error message
        Alert.alert('Registration Failed', result.error);
      } else {
        Alert.alert('Registration Failed', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const renderFieldError = (field: string) => {
    if (errors[field]) {
      return (
        <Text className="text-red-500 text-sm mt-1 mb-2">{errors[field]}</Text>
      );
    }
    return null;
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center justify-center p-4 min-h-screen">
        <Text className="text-2xl font-bold mb-6">Create Account</Text>
        
        <View className="w-full max-w-sm">
          <TextInput
            className={`border p-3 mb-1 w-full rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: '' }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!authState.loading}
          />
          {renderFieldError('email')}

          <TextInput
            className={`border p-3 mb-1 w-full rounded ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) {
                setErrors(prev => ({ ...prev, username: '' }));
              }
            }}
            autoCapitalize="none"
            editable={!authState.loading}
          />
          {renderFieldError('username')}

          <TextInput
            className={`border p-3 mb-1 w-full rounded ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Password (min 8 characters)"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors(prev => ({ ...prev, password: '' }));
              }
            }}
            secureTextEntry
            editable={!authState.loading}
          />
          {renderFieldError('password')}

          <TextInput
            className={`border p-3 mb-1 w-full rounded ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }
            }}
            secureTextEntry
            editable={!authState.loading}
          />
          {renderFieldError('confirmPassword')}
          
          <View className="mt-4 space-y-3">
            {authState.loading ? (
              <View className="items-center py-3">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2">Creating account...</Text>
              </View>
            ) : (
              <>
                <Button title="Create Account" onPress={handleRegister} />
                <Button 
                  title="Already have an account? Login" 
                  onPress={() => router.push('/login')}
                  color="#6B7280"
                />
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}