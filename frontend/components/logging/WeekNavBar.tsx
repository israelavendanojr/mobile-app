import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { WeekDay } from '@/types/logging'; 

interface WeekNavBarProps {
  weekDays: WeekDay[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

const WeekNavBar: React.FC<WeekNavBarProps> = ({
  weekDays,
  selectedDayIndex,
  onSelectDay,
}) => {
  return (
    <View className="bg-white px-4 py-3 border-b border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-3">
        Week {getWeekNumber()} ({getWeekRangeString()})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-3">
          {weekDays.map((day, index) => {
            const isSelected = index === selectedDayIndex;
            const hasWorkout = !!day.workoutLog;
            const isComplete = day.workoutLog?.is_complete;

            return (
              <TouchableOpacity
                key={day.date}
                className={`w-14 h-14 rounded-xl items-center justify-center ${
                  isSelected
                    ? 'bg-blue-500'
                    : hasWorkout
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onPress={() => onSelectDay(index)}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected
                      ? 'text-white'
                      : hasWorkout
                      ? 'text-green-700'
                      : 'text-gray-600'
                  }`}
                >
                  {day.dayName}
                </Text>
                <Text
                  className={`text-lg font-bold ${
                    isSelected
                      ? 'text-white'
                      : hasWorkout
                      ? 'text-green-700'
                      : 'text-gray-800'
                  }`}
                >
                  {new Date(day.date).getDate()}
                </Text>
                {isComplete && (
                  <View className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// Optional helpers to format week header
function getWeekNumber() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  const diff = today.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(((diff / (1000 * 60 * 60 * 24)) + start.getDay() + 1) / 7);
}

function getWeekRangeString() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `Sun. ${weekStart.toLocaleDateString('en-US', options)}`;
}

export default WeekNavBar;
