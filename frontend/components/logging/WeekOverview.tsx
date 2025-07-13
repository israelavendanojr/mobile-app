import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Calendar, CheckCircle, Target } from 'lucide-react-native';
import { WorkoutDay } from '../../types/workout';

interface WeekOverviewProps {
  workoutWeek: WorkoutDay[];
  onDaySelect: (day: WorkoutDay) => void;
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({ workoutWeek, onDaySelect }) => {
  const getDayStatus = (day: WorkoutDay) => {
    if (day.type === 'rest') return 'rest';
    return day.completed ? 'completed' : 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'rest':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const completedWorkouts = workoutWeek.filter(
    (day) => day.type === 'workout' && day.completed
  ).length;
  const totalWorkouts = workoutWeek.filter((day) => day.type === 'workout').length;
  const weekProgress = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

  return (
    <ScrollView className="space-y-6">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-6">
        <Calendar className="text-blue-600" size={24} />
        <Text className="text-2xl font-semibold text-gray-800">Week Overview</Text>
      </View>

      {/* Weekly Progress Card */}
      <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-lg font-semibold text-gray-800">Weekly Progress</Text>
            <Text className="text-sm text-gray-600">
              {completedWorkouts} of {totalWorkouts} workouts completed
            </Text>
          </View>
          <Text className="text-2xl font-bold text-blue-600">
            {Math.round(weekProgress)}%
          </Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <View
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            style={{ width: `${weekProgress}%` }}
          />
        </View>
      </View>

      {/* Day Cards */}
      <View className="flex flex-wrap flex-row justify-between gap-4">
        {workoutWeek.map((day) => {
          const status = getDayStatus(day);
          const statusClasses = getStatusColor(status);

          return (
            <Pressable
              key={day.id}
              className={`w-[48%] p-4 rounded-xl ${statusClasses} ${
                status !== 'rest' ? 'hover:scale-105' : 'opacity-60'
              }`}
              onPress={() => status !== 'rest' && onDaySelect(day)}
            >
              <View className="items-center">
                <Text className="text-sm font-medium mb-1">{day.dayName}</Text>
                <Text className="text-lg font-bold mb-1">{day.name}</Text>
                <Text className="text-xs mb-3 opacity-80 text-center">{day.description}</Text>

                {status === 'completed' && <CheckCircle className="text-white" size={20} />}
                {status === 'pending' && <Target className="text-white" size={20} />}
                {status === 'rest' && <Text className="text-xs">Rest Day</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* This Week's Focus */}
      <View className="bg-white rounded-xl p-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-4">This Week's Focus</Text>
        <View className="flex-col gap-3">
          <View className="flex-row items-center gap-3">
            <View className="w-3 h-3 bg-blue-500 rounded-full" />
            <Text className="text-gray-600">Upper Body Strength</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="w-3 h-3 bg-green-500 rounded-full" />
            <Text className="text-gray-600">Lower Body Power</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
