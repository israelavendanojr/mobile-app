import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

interface PlannedExercise {
  name: string;
  sets: number;
  start_reps: number;
  end_reps: number;
  skip: boolean;
}

interface WorkoutDay {
  day_name: string;
  order: number;
  exercises: PlannedExercise[];
}

interface WorkoutPlan {
  id: number;
  name: string;
  days_per_week: number;
  created_at: string;
  days: WorkoutDay[];
}

export default function ViewPlans() {
  const { authState } = useAuth();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/plan/get/');
      setPlans(response.data);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.response?.data?.error || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const togglePlanExpansion = (planId: number) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const renderExercise = (exercise: PlannedExercise, index: number) => {
    if (exercise.skip) {
      return (
        <View key={index} className="bg-gray-100 p-3 rounded-lg mb-2">
          <Text className="text-gray-500 italic">{exercise.name}</Text>
        </View>
      );
    }

    const repsText = exercise.start_reps === exercise.end_reps 
      ? `${exercise.start_reps} reps`
      : `${exercise.start_reps}-${exercise.end_reps} reps`;

    return (
      <View key={index} className="bg-white p-3 rounded-lg mb-2 border border-gray-200">
        <Text className="font-semibold text-gray-900 mb-1">{exercise.name}</Text>
        <Text className="text-gray-600 text-sm">
          {exercise.sets} sets × {repsText}
        </Text>
      </View>
    );
  };

  const renderWorkoutDay = (day: WorkoutDay) => {
    return (
      <View key={day.order} className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
          {day.day_name}
        </Text>
        <View className="ml-2">
          {day.exercises.map((exercise, index) => renderExercise(exercise, index))}
        </View>
      </View>
    );
  };

  const renderPlan = (plan: WorkoutPlan) => {
    const isExpanded = expandedPlan === plan.id;
    
    return (
      <View key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <TouchableOpacity
          onPress={() => togglePlanExpansion(plan.id)}
          className="p-4 border-b border-gray-100"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">{plan.name}</Text>
              <Text className="text-gray-600 mb-2">
                {plan.days_per_week} days per week
              </Text>
              <Text className="text-sm text-gray-500">
                Created: {formatDate(plan.created_at)}
              </Text>
            </View>
            <View className="ml-4">
              <Text className="text-blue-500 font-medium">
                {isExpanded ? 'Collapse' : 'View Details'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="p-4">
            <ScrollView showsVerticalScrollIndicator={false}>
              {plan.days
                .sort((a, b) => a.order - b.order)
                .map(day => renderWorkoutDay(day))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const handleCreateNewPlan = () => {
    router.push('/generator/welcome');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading your workout plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-red-600 text-center mb-4 text-lg">{error}</Text>
        <TouchableOpacity
          onPress={fetchPlans}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900">My Workout Plans</Text>
        <Text className="text-gray-600 mt-1">
          {plans.length} {plans.length === 1 ? 'plan' : 'plans'} saved
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {plans.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 text-lg mb-2">No workout plans yet</Text>
            <Text className="text-gray-400 text-center mb-6">
              Create your first personalized workout plan to get started
            </Text>
            <TouchableOpacity
              onPress={handleCreateNewPlan}
              className="bg-blue-500 px-8 py-3 rounded-lg"
            >
              <Text className="text-white font-medium text-lg">Create Your First Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {plans.map(plan => renderPlan(plan))}
            
            <TouchableOpacity
              onPress={handleCreateNewPlan}
              className="bg-blue-500 px-6 py-3 rounded-lg mt-4 mb-8"
            >
              <Text className="text-white font-medium text-center text-lg">
                Create New Plan
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}