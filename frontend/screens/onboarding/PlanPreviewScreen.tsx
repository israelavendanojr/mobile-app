import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

export default function PlanPreviewScreen() {
  const { state, generatePlan, savePlan, prevStep, resetOnboarding } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add safety check for state
  if (!state) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  useEffect(() => {
    // Auto-generate plan when screen loads if we don't have one
    if (!state.generatedPlan && !state.loading) {
      handleGeneratePlan();
    }
  }, [state.loading]); // Removed state.generatedPlan from dependencies

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    const success = await generatePlan();
    setIsGenerating(false);
    
    if (!success) {
      Alert.alert(
        'Generation Failed',
        state.error || 'Failed to generate your workout plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    const success = await savePlan();
    setIsSaving(false);
    
    if (!success) {
      Alert.alert(
        'Save Failed',
        state.error || 'Failed to save your workout plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate Plan',
      'Are you sure you want to generate a new plan? This will replace your current plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: handleGeneratePlan },
      ]
    );
  };

  const renderExercise = (exercise: any, index: number) => {
    // Add more detailed logging for exercise structure
    // console.log('Exercise data:', exercise);
    
    if (exercise.skip) {
      return (
        <View key={index} className="bg-gray-100 p-3 rounded-lg mb-2">
          <Text className="text-gray-500 italic">{exercise.exercise_name}</Text>
        </View>
      );
    }

    return (
      <View key={index} className="bg-white border border-gray-200 p-4 rounded-lg mb-2">
        <Text className="font-semibold text-gray-800 text-lg">
          {exercise.exercise_name || exercise.name || 'Unknown Exercise'}
        </Text>
        <Text className="text-gray-600 mt-1">
          {exercise.sets || 'N/A'} sets × {exercise.start_reps || exercise.reps || 'N/A'}
          {exercise.end_reps && exercise.end_reps !== exercise.start_reps && `-${exercise.end_reps}`} reps
        </Text>
      </View>
    );
  };

  const renderDay = (day: any, index: number) => {
    // console.log('Day data:', day);
    
    return (
      <View key={index} className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-3">
          {day.day_name || day.name || `Day ${index + 1}`}
        </Text>
        <View className="ml-2">
          {day.exercises && day.exercises.length > 0 ? (
            day.exercises.map((exercise: any, exIndex: number) => 
              renderExercise(exercise, exIndex)
            )
          ) : (
            <Text className="text-gray-500 italic">No Suitable Exercises</Text>
          )}
        </View>
      </View>
    );
  };

  if (isGenerating || (state.loading && !state.generatedPlan)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg font-medium text-gray-700">
          Generating your personalized workout plan...
        </Text>
        <Text className="mt-2 text-gray-500 text-center px-4">
          This may take a few seconds while we create the perfect plan for you
        </Text>
      </View>
    );
  }

  if (state.error && !state.generatedPlan) {
    return (
      <View className="flex-1 bg-white p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-bold text-red-600 mb-4">
            Generation Failed
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            {state.error}
          </Text>
          <View className="w-full max-w-sm space-y-3">
            <Button
              title="Try Again"
              onPress={handleGeneratePlan}
              disabled={isGenerating}
            />
            <Button
              title="Go Back"
              onPress={prevStep}
              color="#6B7280"
            />
          </View>
        </View>
      </View>
    );
  }

  if (!state.generatedPlan) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-600 mb-4">
          No plan generated yet
        </Text>
        <Button
          title="Generate Plan"
          onPress={handleGeneratePlan}
          disabled={isGenerating}
        />
      </View>
    );
  }

  // Debug logging
  // console.log('=== DEBUG INFO ===');
  // console.log('state.generatedPlan:', state.generatedPlan);
  // console.log('Type of generatedPlan:', typeof state.generatedPlan);
  // console.log('Is array?', Array.isArray(state.generatedPlan));
  // console.log('Is truthy?', !!state.generatedPlan);
  // if (state.generatedPlan && typeof state.generatedPlan === 'object') {
  //   console.log('Keys:', Object.keys(state.generatedPlan));
  //   if (state.generatedPlan.days) {
  //     console.log('Days array length:', state.generatedPlan.days.length);
  //     console.log('First day:', state.generatedPlan.days[0]);
  //   }
  // }
  // console.log('==================');

  // Get the days array from the plan
  const daysArray = Array.isArray(state.generatedPlan) 
    ? state.generatedPlan 
    : state.generatedPlan.days || [];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
          Workout Plan Preview
        </Text>
        <Text className="text-center text-gray-600 mb-6">
          Preview your personalized workout plan
        </Text>
        
        {/* Show plan name if available */}
        {state.generatedPlan?.name && (
          <Text className="text-center text-lg font-semibold text-blue-600 mb-4">
            {state.generatedPlan.name}
          </Text>
        )}
        
        {/* Debug display */}
        <Text className="text-sm text-gray-500 mb-4">
          Debug: Plan exists: {state.generatedPlan ? 'Yes' : 'No'}, 
          Type: {typeof state.generatedPlan}, 
          Is Array: {Array.isArray(state.generatedPlan) ? 'Yes' : 'No'}
        </Text>
        
        {/* Render days */}
        {daysArray.length > 0 ? (
          daysArray.map((day: any, index: number) => 
            renderDay(day, index)
          )
        ) : (
          <View className="items-center justify-center p-8">
            <Text className="text-gray-500 text-lg">
              No workout days found in your plan
            </Text>
          </View>
        )}
        
        {/* Action buttons */}
        <View className="mt-6 space-y-3">
          <Button
            title="Regenerate Plan"
            onPress={handleRegenerate}
            disabled={isGenerating}
          />
          <Button
            title="Save Plan"
            onPress={handleSavePlan}
            disabled={isSaving}
            color="#22c55e"
          />
        </View>
      </View>
    </ScrollView>
  );
}