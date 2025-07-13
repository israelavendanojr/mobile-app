import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, ArrowLeft } from 'lucide-react-native';
import { WeekOverview } from '../../components/logging/WeekOverview';
import DayWorkout from '../../components/logging/DayWorkout';
import workoutData from '../../utils/workoutData';
import { WorkoutDay } from '../../types/workout';

const LogPage = () => {
  const [currentScreen, setCurrentScreen] = useState<'overview' | 'workout'>('overview');
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [workoutWeek, setWorkoutWeek] = useState(workoutData.currentWeek);

  const handleDaySelect = (day: WorkoutDay) => {
    setSelectedDay(day);
    setCurrentScreen('workout');
  };

  const handleDayUpdate = (updatedDay: WorkoutDay) => {
    setWorkoutWeek(prev =>
      prev.map(day => day.id === updatedDay.id ? updatedDay : day)
    );
    setSelectedDay(updatedDay);
  };

  const handleBackToOverview = () => {
    setSelectedDay(null);
    setCurrentScreen('overview');
  };

  return (
    <View className="flex-1 bg-blue-50 pt-5">
      <View className="px-4 py-6">
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-800 mb-1">Fitness Tracker</Text>
            <Text className="text-gray-600">
              Track your progress and build strength consistently
            </Text>
          </View>

          {currentScreen === 'overview' && (
            <View className="flex-row items-center gap-2 p-2 bg-white rounded-lg shadow">
              <Calendar className="text-blue-600" size={20} />
              <Text className="text-sm font-medium">
                Week {workoutData.currentWeekNumber}
              </Text>
            </View>
          )}

          {currentScreen === 'workout' && (
            <TouchableOpacity
              onPress={handleBackToOverview}
              className="flex-row items-center gap-2 px-4 py-2 bg-white rounded-lg shadow"
            >
              <ArrowLeft className="text-gray-600" size={20} />
              <Text className="text-sm font-medium">Back to Week</Text>
            </TouchableOpacity>
          )}
        </View>

        {currentScreen === 'overview' && (
          <WeekOverview
            workoutWeek={workoutWeek}
            onDaySelect={handleDaySelect}
          />
        )}

        {currentScreen === 'workout' && selectedDay && (
          <DayWorkout
            day={selectedDay}
            onBack={handleBackToOverview}
            onUpdate={handleDayUpdate}
          />
        )}
      </View>
    </View>
  );
};

export default LogPage;
