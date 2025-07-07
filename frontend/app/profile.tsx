import { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Profile() {
  const { authState, updateProfile, deleteAccount, onLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (authState.user) {
      setFormData({
        email: authState.user.email || '',
        username: authState.user.username || '',
        first_name: authState.user.first_name || '',
        last_name: authState.user.last_name || '',
      });
    }
  }, [authState.user]);

  const handleUpdateProfile = async () => {
    if (!formData.email || !formData.username) {
      Alert.alert('Error', 'Email and username are required');
      return;
    }

    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await deleteAccount();
            setLoading(false);

            if (result.success) {
              Alert.alert('Account Deleted', 'Your account has been deleted successfully');
              router.replace('/auth/login');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await onLogout();
    router.replace('/auth/login');
  };

  if (!authState.user) {
    return (
      <ProtectedRoute>
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2">Loading profile...</Text>
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ScrollView className="flex-1 bg-white p-4">
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold mb-2">Profile</Text>
          <Text className="text-gray-600">Manage your account information</Text>
        </View>

        {isEditing ? (
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded"
                value={formData.username}
                onChangeText={(text) => setFormData({...formData, username: text})}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">First Name</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded"
                value={formData.first_name}
                onChangeText={(text) => setFormData({...formData, first_name: text})}
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Last Name</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded"
                value={formData.last_name}
                onChangeText={(text) => setFormData({...formData, last_name: text})}
                editable={!loading}
              />
            </View>

            <View className="flex-row space-x-2 mt-6">
              {loading ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <>
                  <View className="flex-1 mr-2">
                    <Button title="Save" onPress={handleUpdateProfile} />
                  </View>
                  <View className="flex-1 ml-2">
                    <Button 
                      title="Cancel" 
                      onPress={() => {
                        setIsEditing(false);
                        // Reset form data
                        setFormData({
                          email: authState.user.email || '',
                          username: authState.user.username || '',
                          first_name: authState.user.first_name || '',
                          last_name: authState.user.last_name || '',
                        });
                      }}
                      color="#6B7280"
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        ) : (
          <View className="space-y-4">
            <View className="bg-gray-50 p-4 rounded">
              <Text className="text-sm font-medium text-gray-700">Email</Text>
              <Text className="text-lg">{authState.user.email}</Text>
            </View>

            <View className="bg-gray-50 p-4 rounded">
              <Text className="text-sm font-medium text-gray-700">Username</Text>
              <Text className="text-lg">{authState.user.username || 'Not set'}</Text>
            </View>

            <View className="bg-gray-50 p-4 rounded">
              <Text className="text-sm font-medium text-gray-700">First Name</Text>
              <Text className="text-lg">{authState.user.first_name || 'Not set'}</Text>
            </View>

            <View className="bg-gray-50 p-4 rounded">
              <Text className="text-sm font-medium text-gray-700">Last Name</Text>
              <Text className="text-lg">{authState.user.last_name || 'Not set'}</Text>
            </View>

            <View className="bg-gray-50 p-4 rounded">
              <Text className="text-sm font-medium text-gray-700">Member Since</Text>
              <Text className="text-lg">
                {authState.user.date_joined ? 
                  new Date(authState.user.date_joined).toLocaleDateString() : 
                  'Unknown'
                }
              </Text>
            </View>

            <View className="space-y-2 mt-6">
              <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
              <Button title="Go Back" onPress={() => router.back()} color="#6B7280" />
              <Button title="Logout" onPress={handleLogout} color="#059669" />
              <Button title="Delete Account" onPress={handleDeleteAccount} color="#DC2626" />
            </View>
          </View>
        )}
      </ScrollView>
    </ProtectedRoute>
  );
}