import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ExerciseLog } from '@/types/logging';

interface ExerciseCardProps {
  exercise: ExerciseLog;
  exerciseIndex: number;
  onAddSet: (exerciseIndex: number) => void;
  onEditSet: (exerciseIndex: number, setIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  onAddSet,
  onEditSet,
  onRemoveSet,
}) => {
  const completedSets = exercise.sets.length;
  const targetSets = exercise.target_sets;
  const isComplete = completedSets >= targetSets;

  // Mock data — replace with real DB values in future
  const exerciseDetails = {
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
  };

  return (
    <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            {exercise.name}
          </Text>
          <View
            className={`px-3 py-1 rounded-full ${
              isComplete
                ? 'bg-green-500'
                : completedSets > 0
                ? 'bg-orange-500'
                : 'bg-gray-500'
            }`}
          >
            <Text className="text-white text-sm font-semibold">
              {completedSets}/{targetSets}
            </Text>
          </View>
        </View>
      </View>

      {/* Target Muscles */}
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Target Muscles
        </Text>
        <View className="flex-row flex-wrap">
          {exerciseDetails.targetMuscles.map((muscle, idx) => (
            <View
              key={idx}
              className="bg-blue-50 px-3 py-1 rounded-full mr-2 mb-2"
            >
              <Text className="text-blue-700 text-sm font-medium">
                {muscle}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Logging Section */}
      <View className="p-4">
        <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          {/* Log status */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Your Log</Text>
            <View
              className={`px-3 py-1 rounded-full ${
                isComplete
                  ? 'bg-green-100'
                  : completedSets > 0
                  ? 'bg-orange-100'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isComplete
                    ? 'text-green-700'
                    : completedSets > 0
                    ? 'text-orange-700'
                    : 'text-gray-600'
                }`}
              >
                {isComplete
                  ? 'Complete'
                  : completedSets > 0
                  ? 'In Progress'
                  : 'Not Started'}
              </Text>
            </View>
          </View>

          {/* Target Info */}
          <View className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <Text className="text-sm text-gray-600 text-center">
              <Text className="font-semibold">Target:</Text> {targetSets} sets ×{' '}
              {exercise.target_reps} reps
            </Text>
          </View>

          {/* Sets */}
          {completedSets > 0 ? (
            <View className="space-y-3 mb-4">
              {exercise.sets.map((set, setIndex) => (
                <View
                  key={setIndex}
                  className="flex-row items-center bg-white rounded-lg p-3 shadow-sm"
                >
                  <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-white">
                      {set.set_number}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-between"
                    onPress={() => onEditSet(exerciseIndex, setIndex)}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {set.weight}lbs × {set.reps} reps
                      </Text>
                      {set.rpe && (
                        <Text className="text-sm text-gray-500 mt-1">
                          RPE: {set.rpe}/10
                        </Text>
                      )}
                      {set.notes && (
                        <Text className="text-xs text-gray-400 mt-1 italic">
                          {set.notes}
                        </Text>
                      )}
                    </View>
                    <View className="w-6 h-6 items-center justify-center">
                      <Text className="text-gray-400 text-lg">›</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="ml-3 w-8 h-8 items-center justify-center"
                    onPress={() => onRemoveSet(exerciseIndex, setIndex)}
                  >
                    <Text className="text-red-500 text-lg font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-6 items-center">
              <Text className="text-gray-500 text-center mb-2">
                No sets logged yet
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Tap "Add Set" to get started
              </Text>
            </View>
          )}

          {/* Add Set Button */}
          <TouchableOpacity
            className="bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
            onPress={() => onAddSet(exerciseIndex)}
          >
            <Text className="text-white font-semibold text-base mr-2">+</Text>
            <Text className="text-white font-semibold text-base">Add Set</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Demo */}
      <View className="mx-4 mb-4">
        <View className="h-40 bg-gray-100 rounded-xl items-center justify-center">
          <View className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center rounded-xl">
            <Text className="text-white text-5xl">💪</Text>
            <Text className="text-white text-sm mt-2 font-medium">
              Form Demo
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ExerciseCard;
