import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { X, Target, AlertCircle } from 'lucide-react-native';

const ExerciseForm = ({ exercise, onClose, visible }) => {
  const formSteps = [
    'Start with feet shoulder-width apart',
    'Keep your core engaged throughout',
    'Control the movement - slow and steady',
    'Focus on the target muscles working',
    'Breathe out during the exertion phase',
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-4"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-xl w-full max-h-[80%]"
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">{exercise.name}</Text>
              <Pressable onPress={onClose} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </Pressable>
            </View>

            {/* Target Muscles */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Target size={20} className="text-blue-600" />
                <Text className="font-medium text-gray-700">Target Muscles</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, index) => (
                  <Text
                    key={index}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {muscle}
                  </Text>
                ))}
              </View>
            </View>

            {/* Form Illustration */}
            <View className="mb-6">
              <View className="bg-gray-100 rounded-lg p-4 mb-4">
                <Text className="text-center text-gray-600 text-sm">Exercise Form Illustration</Text>
                <View className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mt-2 items-center justify-center">
                  <Text className="text-blue-600 text-sm">Form Guide Visual</Text>
                </View>
              </View>
            </View>

            {/* Steps */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <AlertCircle size={20} className="text-orange-600" />
                <Text className="font-medium text-gray-700">Proper Form Steps</Text>
              </View>
              <View className="space-y-2">
                {formSteps.map((step, index) => (
                  <View key={index} className="flex-row gap-3 items-start">
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-medium">{index + 1}</Text>
                    </View>
                    <Text className="text-sm text-gray-600 flex-1">{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tip Box */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <View className="flex-row gap-2 items-start">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-yellow-800">Beginner Tip</Text>
                  <Text className="text-sm text-yellow-700 mt-1">
                    Start with lighter weights to master the form. Quality over quantity - perfect
                    reps build strength safely.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ExerciseForm;
