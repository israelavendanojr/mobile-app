import React from 'react';
import { View, Text } from 'react-native';
import { WorkoutLog } from '@/types/logging';

interface DayOverviewCardProps {
  workoutLog: WorkoutLog;
}

const DayOverviewCard: React.FC<DayOverviewCardProps> = ({ workoutLog }) => {
  const totalSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const targetSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
  const completionPercentage = targetSets > 0
    ? Math.round((totalSets / targetSets) * 100)
    : 0;

  return (
    <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              {workoutLog.workout_day?.day_name || 'Workout'}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {workoutLog.exercises.length} exercises
            </Text>
          </View>
          <View className="items-end">
            <View
              className={`px-3 py-1 rounded-full ${
                workoutLog.is_complete ? 'bg-green-100' : 'bg-blue-100'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  workoutLog.is_complete ? 'text-green-700' : 'text-blue-700'
                }`}
              >
                {workoutLog.is_complete ? 'Complete' : 'In Progress'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-gray-600">Progress</Text>
          <Text className="text-sm font-bold text-gray-900">
            {completionPercentage}%
          </Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 mt-1">
          {totalSets} of {targetSets} sets completed
        </Text>
      </View>
    </View>
  );
};

export default DayOverviewCard;
