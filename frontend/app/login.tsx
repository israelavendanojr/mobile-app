import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

export default function Login() {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!loginInput) {
      newErrors.loginInput = 'Email or username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    const result = await onLogin(loginInput, password);
    if (result.success) {
      router.replace('/');
    } else {
      // Handle different types of errors
      if (result.errors) {
        // Field-specific errors from backend
        setErrors(result.errors);
      } else if (result.error) {
        // General error message
        if (result.error.includes('Invalid credentials')) {
          setErrors({
            loginInput: 'Invalid email/username or password',
            password: 'Invalid email/username or password'
          });
        } else {
          Alert.alert('Login Failed', result.error);
        }
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
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
        <Text className="text-2xl font-bold mb-6">Welcome Back</Text>
        
        <View className="w-full max-w-sm">
          <TextInput
            className={`border p-3 mb-1 w-full rounded ${
              errors.loginInput ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Email or Username"
            value={loginInput}
            onChangeText={(text) => {
              setLoginInput(text);
              if (errors.loginInput) {
                setErrors(prev => ({ ...prev, loginInput: '' }));
              }
            }}
            autoCapitalize="none"
            editable={!authState.loading}
          />
          {renderFieldError('loginInput')}

          <TextInput
            className={`border p-3 mb-1 w-full rounded ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Password"
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
          
          <View className="mt-4 space-y-3">
            {authState.loading ? (
              <View className="items-center py-3">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2">Signing in...</Text>
              </View>
            ) : (
              <>
                <Button title="Sign In" onPress={handleLogin} />
                <Button 
                  title="Don't have an account? Register" 
                  onPress={() => router.push('/register')}
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