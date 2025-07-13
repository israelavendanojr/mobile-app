import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ArrowLeft, Target, Clock, Zap } from 'lucide-react-native';
import { WorkoutDay, Exercise } from '../../types/workout';
import ExerciseCard from './ExerciseCard';

interface DayWorkoutProps {
  day: WorkoutDay;
  onBack: () => void;
  onUpdate: (updatedDay: WorkoutDay) => void;
}

const DayWorkout: React.FC<DayWorkoutProps> = ({ day, onBack, onUpdate }) => {
  const [exercises, setExercises] = useState(day.exercises || []);

  const updateExercise = (exerciseId: number, updatedExercise: Exercise) => {
    const updatedExercises = exercises.map((ex) =>
      ex.id === exerciseId ? updatedExercise : ex
    );
    setExercises(updatedExercises);
    onUpdate({ ...day, exercises: updatedExercises });
  };

  const completedExercises = exercises.filter(
    (ex) => ex.sets && ex.sets.some((set) => set.completed)
  ).length;

  const progressPercentage =
    exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0;

  return (
    <ScrollView className="space-y-6 px-4 py-6">
      {/* Header */}
      <View className="flex-row items-start gap-4 mb-4">
        <Pressable
          onPress={onBack}
          className="p-2 bg-white rounded-lg shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800">{day.name}</Text>
          <Text className="text-gray-600 mt-1">{day.description}</Text>
        </View>
      </View>

      {/* Stats & Progress Bar */}
      <View className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <View className="flex-row justify-between flex-wrap gap-4">
          <View className="flex-row items-center gap-2">
            <Target size={18} className="text-blue-600" />
            <Text className="text-sm text-gray-600">{exercises.length} Exercises</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Clock size={18} className="text-green-600" />
            <Text className="text-sm text-gray-600">45-60 min</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Zap size={18} className="text-orange-600" />
            <Text className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% Complete
            </Text>
          </View>
        </View>

        <View className="w-full bg-gray-200 rounded-full h-2">
          <View
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>

      {/* Exercises List */}
      <View className="space-y-4">
        <Text className="text-lg font-semibold text-gray-800">Today's Exercises</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-4 py-2">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={(updatedExercise) =>
                  updateExercise(exercise.id, updatedExercise)
                }
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Pro Tips */}
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-800 mb-3">
          Pro Tips for {day.name}
        </Text>
        <View className="space-y-2">
          <Text className="text-sm text-gray-600">• Focus on controlled movements and proper form</Text>
          <Text className="text-sm text-gray-600">• Rest 60–90 seconds between sets for strength</Text>
          <Text className="text-sm text-gray-600">• Track your weights to ensure progressive overload</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DayWorkout;
