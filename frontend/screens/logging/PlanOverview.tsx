import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Target } from 'lucide-react-native';

// Define TypeScript interfaces
interface Plan {
  id: string | number;
  name: string;
  description: string;
  difficulty: string;
  duration: string;
  daysPerWeek: number;
  goals: string[];
}

interface PlanOverviewProps {
  plans?: Plan[];
  onSelectPlan: (plan: Plan) => void;
  loading?: boolean;
  error?: string;
}

const PlanOverview: React.FC<PlanOverviewProps> = ({ 
  plans = [], 
  onSelectPlan, 
  loading = false, 
  error 
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Loading workout plans...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-xl font-bold text-red-600 mb-4">
          Error Loading Plans
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          {error}
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 py-2 px-4 rounded-lg"
          onPress={() => {
            // Add retry logic here if needed
            console.log('Retry loading plans');
          }}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (!plans || plans.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Target className="text-gray-400" size={48} />
        <Text className="text-xl font-bold text-gray-600 mt-4 mb-2">
          No Plans Available
        </Text>
        <Text className="text-gray-500 text-center">
          No workout plans found. Create your first plan to get started!
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 py-2 px-4 rounded-lg mt-4"
          onPress={() => {
            // Add navigation to create plan if needed
            console.log('Navigate to create plan');
          }}
        >
          <Text className="text-white font-medium">Create Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="space-y-6 p-4">
      <View className="flex-row items-center gap-3 mb-6">
        <Target className="text-blue-600" size={24} />
        <Text className="text-2xl font-semibold text-gray-800">Workout Plans</Text>
      </View>

      {plans.map((plan) => (
        <View
          key={plan.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-6"
        >
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-lg font-semibold text-gray-800 mb-1">{plan.name}</Text>
              <Text className="text-sm text-gray-600">{plan.description}</Text>
            </View>
            <View className={`px-2 py-1 rounded-full ${getDifficultyColor(plan.difficulty)}`}>
              <Text className="text-xs font-medium">{plan.difficulty}</Text>
            </View>
          </View>

          <View className="space-y-2 mb-4">
            <View className="flex-row justify-between text-sm">
              <Text className="text-gray-600">Duration:</Text>
              <Text className="font-medium">{plan.duration}</Text>
            </View>
            <View className="flex-row justify-between text-sm">
              <Text className="text-gray-600">Days per week:</Text>
              <Text className="font-medium">{plan.daysPerWeek}</Text>
            </View>
            <View className="flex-row justify-between text-sm items-start">
              <Text className="text-gray-600">Goals:</Text>
              <View className="flex-row flex-wrap gap-1 max-w-[60%] justify-end">
                {(plan.goals || []).map((goal, index) => (
                  <View
                    key={index}
                    className="bg-blue-100 px-2 py-1 rounded-full"
                  >
                    <Text className="text-xs text-blue-700">{goal}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => onSelectPlan(plan)}
            className="bg-blue-600 py-2 px-4 rounded-lg mt-2"
          >
            <Text className="text-white text-center font-medium">Select Plan</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View className="bg-white rounded-xl p-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          How to Choose Your Plan
        </Text>
        <View className="flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <View className="items-center p-4 bg-green-50 rounded-lg">
            <Text className="text-2xl mb-2">🌱</Text>
            <Text className="font-medium text-green-800 mb-1">Beginner</Text>
            <Text className="text-sm text-green-700 text-center">
              New to lifting or returning after a break
            </Text>
          </View>
          <View className="items-center p-4 bg-yellow-50 rounded-lg">
            <Text className="text-2xl mb-2">🏋️</Text>
            <Text className="font-medium text-yellow-800 mb-1">Intermediate</Text>
            <Text className="text-sm text-yellow-700 text-center">
              6+ months of consistent training
            </Text>
          </View>
          <View className="items-center p-4 bg-red-50 rounded-lg">
            <Text className="text-2xl mb-2">🔥</Text>
            <Text className="font-medium text-red-800 mb-1">Advanced</Text>
            <Text className="text-sm text-red-700 text-center">
              2+ years of serious training
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PlanOverview;