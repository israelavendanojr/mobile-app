import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

export default function PreferencesScreen() {
  const { state, updatePreferences, nextStep, prevStep, setError } = useOnboarding();
  
  const [formData, setFormData] = useState({
    days_per_week: state.preferences.days_per_week || 3,
    training_age: state.preferences.training_age || 0,
    volume: state.preferences.volume || 'moderate' as 'low' | 'moderate' | 'high',
    priority_muscles: state.preferences.priority_muscles || [],
    equipment: state.preferences.equipment || [],
    bodyweight_exercises: state.preferences.bodyweight_exercises || 'weighted' as 'bodyweight' | 'weighted' | 'absent',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const volumeOptions = [
    { value: 'low', label: 'Low Volume', description: 'Minimal training, focus on recovery' },
    { value: 'moderate', label: 'Moderate Volume', description: 'Balanced approach, good for most people' },
    { value: 'high', label: 'High Volume', description: 'Intense training, for experienced athletes' },
  ];

  const bodyweightOptions = [
    { value: 'bodyweight', label: 'Bodyweight Only', description: 'No external weights' },
    { value: 'weighted', label: 'Weighted Exercises', description: 'Use additional weights' },
    { value: 'absent', label: 'No Bodyweight', description: 'Machine/weight exercises only' },
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (formData.days_per_week < 1 || formData.days_per_week > 7) {
      newErrors.days_per_week = 'Days per week must be between 1 and 7';
    }
    
    if (formData.training_age < 0) {
      newErrors.training_age = 'Training age cannot be negative';
    }
    
    if (!formData.volume) {
      newErrors.volume = 'Please select a volume preference';
    }
    
    if (!formData.bodyweight_exercises) {
      newErrors.bodyweight_exercises = 'Please select your bodyweight preference';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    
    updatePreferences(formData);
    nextStep();
  };

  const handleMuscleToggle = (muscleId: number) => {
    setFormData(prev => ({
      ...prev,
      priority_muscles: prev.priority_muscles.includes(muscleId)
        ? prev.priority_muscles.filter(id => id !== muscleId)
        : [...prev.priority_muscles, muscleId]
    }));
  };

  const handleEquipmentToggle = (equipmentId: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(id => id !== equipmentId)
        : [...prev.equipment, equipmentId]
    }));
  };

  const renderFieldError = (field: string) => {
    if (errors[field]) {
      return (
        <Text className="text-red-500 text-sm mt-1 mb-2">{errors[field]}</Text>
      );
    }
    return null;
  };

  if (state.loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            Your Preferences
          </Text>
          <Text className="text-center text-gray-600">
            Tell us about your fitness goals and available resources
          </Text>
        </View>

        {state.error && (
          <View className="bg-red-50 p-4 rounded-lg mb-6">
            <Text className="text-red-600 text-center">{state.error}</Text>
          </View>
        )}

        {/* Days per week */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            How many days per week do you want to train?
          </Text>
          <TextInput
            className={`border p-3 rounded text-center text-lg ${
              errors.days_per_week ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.days_per_week.toString()}
            onChangeText={(text) => setFormData(prev => ({ 
              ...prev, 
              days_per_week: parseInt(text) || 0 
            }))}
            keyboardType="numeric"
            placeholder="3"
          />
          {renderFieldError('days_per_week')}
        </View>

        {/* Training age */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            How many years have you been training?
          </Text>
          <TextInput
            className={`border p-3 rounded text-center text-lg ${
              errors.training_age ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.training_age.toString()}
            onChangeText={(text) => setFormData(prev => ({ 
              ...prev, 
              training_age: parseInt(text) || 0 
            }))}
            keyboardType="numeric"
            placeholder="0"
          />
          {renderFieldError('training_age')}
        </View>

        {/* Volume preference */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            What volume do you prefer?
          </Text>
          {volumeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`border p-4 rounded-lg mb-2 ${
                formData.volume === option.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-white'
              }`}
              onPress={() => setFormData(prev => ({ 
                ...prev, 
                volume: option.value as 'low' | 'moderate' | 'high' 
              }))}
            >
              <Text className={`font-medium ${
                formData.volume === option.value ? 'text-blue-700' : 'text-gray-800'
              }`}>
                {option.label}
              </Text>
              <Text className={`text-sm ${
                formData.volume === option.value ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
          {renderFieldError('volume')}
        </View>

        {/* Bodyweight preference */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Bodyweight Exercise Preference
          </Text>
          {bodyweightOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`border p-4 rounded-lg mb-2 ${
                formData.bodyweight_exercises === option.value 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-white'
              }`}
              onPress={() => setFormData(prev => ({ 
                ...prev, 
                bodyweight_exercises: option.value as 'bodyweight' | 'weighted' | 'absent' 
              }))}
            >
              <Text className={`font-medium ${
                formData.bodyweight_exercises === option.value ? 'text-green-700' : 'text-gray-800'
              }`}>
                {option.label}
              </Text>
              <Text className={`text-sm ${
                formData.bodyweight_exercises === option.value ? 'text-green-600' : 'text-gray-600'
              }`}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
          {renderFieldError('bodyweight_exercises')}
        </View>

        {/* Priority muscles */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Priority Muscles (Optional)
          </Text>
          <Text className="text-gray-600 mb-3">
            Select the muscles you want to focus on
          </Text>
          <View className="flex-row flex-wrap">
            {state.muscles.map((muscle) => (
              <TouchableOpacity
                key={muscle.id}
                className={`border p-3 rounded-lg m-1 ${
                  formData.priority_muscles.includes(muscle.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => handleMuscleToggle(muscle.id)}
              >
                <Text className={`text-sm ${
                  formData.priority_muscles.includes(muscle.id) 
                    ? 'text-purple-700' 
                    : 'text-gray-800'
                }`}>
                  {muscle.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Available Equipment (Optional)
          </Text>
          <Text className="text-gray-600 mb-3">
            Select the equipment you have access to
          </Text>
          <View className="flex-row flex-wrap">
            {state.equipmentOptions.map((equipment) => (
              <TouchableOpacity
                key={equipment.id}
                className={`border p-3 rounded-lg m-1 ${
                  formData.equipment.includes(equipment.id)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 bg-white'
                }`}
                onPress={() => handleEquipmentToggle(equipment.id)}
              >
                <Text className={`text-sm ${
                  formData.equipment.includes(equipment.id) 
                    ? 'text-orange-700' 
                    : 'text-gray-800'
                }`}>
                  {equipment.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation buttons */}
        <View className="flex-row space-x-4 mb-6">
          <View className="flex-1">
            <Button
              title="Back"
              onPress={prevStep}
              color="#6B7280"
              disabled={state.loading}
            />
          </View>
          <View className="flex-1">
            <Button
              title="Next"
              onPress={handleNext}
              disabled={state.loading}
            />
          </View>
        </View>

        <View className="flex-row justify-center">
          <Text className="text-gray-500 text-sm">
            Step 2 of {state.totalSteps}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}