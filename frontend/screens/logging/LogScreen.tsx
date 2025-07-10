import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import WeekNavBar from '@/components/logging/WeekNavBar';
import DayOverviewCard from '@/components/logging/DayOverviewCard';
import ExerciseCard from '@/components/logging/ExerciseCard';
import SetEditorModal from '@/components/logging/SetEditorModal';
import WorkoutActions from '@/components/logging/WorkoutActions';
import { SetLog, WorkoutLog, WeekDay } from '@/types/logging';

export default function WorkoutLogScreen() {
  const { authState } = useAuth();
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<{
    setIndex: number;
    exerciseIndex: number;
    set: SetLog;
  } | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  useEffect(() => {
    initializeWeekView();
  }, []);

  const getCurrentWorkoutLog = (): WorkoutLog | null => {
    return weekDays[selectedDayIndex]?.workoutLog || null;
  };

  const updateCurrentWorkoutLog = (updatedLog: WorkoutLog) => {
    const updatedDays = [...weekDays];
    updatedDays[selectedDayIndex] = {
      ...updatedDays[selectedDayIndex],
      workoutLog: updatedLog,
    };
    setWeekDays(updatedDays);
  };

  const initializeWeekView = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());

    const days: WeekDay[] = [];
    let todayIndex = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const isToday = dateString === today.toISOString().split('T')[0];

      if (isToday) todayIndex = i;

      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        isPast: date < today && !isToday,
        isFuture: date > today,
        workoutLog: undefined,
      });
    }

    setWeekDays(days);
    setSelectedDayIndex(todayIndex);
    loadWeekLog();
  };

  const loadWeekLog = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/workout/log/week/');
      const log = response.data;

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const days: WeekDay[] = [...Array(7)].map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];

        const matchedLog = log.days.find((d: any) => d.order === i);

        return {
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday,
          isPast: date < today && !isToday,
          isFuture: date > today,
          workoutLog: matchedLog ?? undefined,
        };
      });

      setWeekDays(days);
      setSelectedDayIndex(days.findIndex((d) => d.isToday));
    } catch (err) {
      console.error('Failed to load week log:', err);
      setError('Could not load weekly workout log.');
    } finally {
      setLoading(false);
    }
  };

  const selectDay = (dayIndex: number) => {
    if (dayIndex === selectedDayIndex) return;
    setSelectedDayIndex(dayIndex);
  };

  const addSet = (exerciseIndex: number) => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    const updatedLog = { ...currentLog };
    const exercise = updatedLog.exercises[exerciseIndex];

    const lastSetNumber =
      exercise.sets.length > 0
        ? Math.max(...exercise.sets.map((s) => s.set_number))
        : 0;

    const newSet: SetLog = {
      set_number: lastSetNumber + 1,
      weight:
        exercise.sets.length > 0
          ? exercise.sets[exercise.sets.length - 1].weight
          : 0,
      reps: exercise.target_reps,
      rpe: undefined,
      notes: '',
      source: 'manual',
    };

    exercise.sets.push(newSet);
    updateCurrentWorkoutLog(updatedLog);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    Alert.alert('Remove Set', 'Are you sure you want to remove this set?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updatedLog = { ...currentLog };
          updatedLog.exercises[exerciseIndex].sets.splice(setIndex, 1);
          updatedLog.exercises[exerciseIndex].sets.forEach((set, idx) => {
            set.set_number = idx + 1;
          });
          updateCurrentWorkoutLog(updatedLog);
        },
      },
    ]);
  };

  const openSetEditor = (exerciseIndex: number, setIndex: number) => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    const set = currentLog.exercises[exerciseIndex].sets[setIndex];
    setEditingSet({
      exerciseIndex,
      setIndex,
      set: { ...set },
    });
  };

  const saveSetEdit = () => {
    const currentLog = getCurrentWorkoutLog();
    if (!editingSet || !currentLog) return;

    const updatedLog = { ...currentLog };
    updatedLog.exercises[editingSet.exerciseIndex].sets[editingSet.setIndex] =
      editingSet.set;

    updateCurrentWorkoutLog(updatedLog);
    setEditingSet(null);
  };

  const submitWorkout = async () => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    Alert.alert('Complete Workout', 'Are you sure you want to mark this workout as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            setSaving(true);
            const submitData = { ...currentLog, is_complete: true };
            await api.post(`/api/workout/log/day/${currentLog.id}/submit/`, submitData);
            updateCurrentWorkoutLog(submitData);
            Alert.alert('Workout Completed!', 'Great job! Your workout has been logged successfully.');
          } catch (err: any) {
            console.error('Error submitting workout:', err);
            Alert.alert('Error', err.response?.data?.error || 'Failed to submit workout');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const saveProgress = async () => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    try {
      setSaving(true);
      await api.post('/api/workout/log/submit/', currentLog);
      Alert.alert('Progress Saved', 'Your workout progress has been saved.');
    } catch (err: any) {
      console.error('Error saving progress:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  if (loading && weekDays.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading your weekly workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-red-600 text-center mb-4 text-lg">{error}</Text>
        <TouchableOpacity
          onPress={initializeWeekView}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentLog = getCurrentWorkoutLog();
  const selectedDay = weekDays[selectedDayIndex];

  return (
    <View className="flex-1 bg-gray-50">
      <WeekNavBar
        weekDays={weekDays}
        selectedDayIndex={selectedDayIndex}
        onSelectDay={selectDay}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {selectedDay?.isFuture ? (
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-gray-500 text-lg text-center">
              This workout is scheduled for the future.
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Come back on {selectedDay.dayName} to log your workout!
            </Text>
          </View>
        ) : !currentLog ? (
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-gray-500 text-lg text-center mb-4">
              No workout logged for {selectedDay?.dayName}
            </Text>
            {selectedDay?.isToday && (
              <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg">
                <Text className="text-white font-medium">Start Today's Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <DayOverviewCard workoutLog={currentLog} />

            <View className="mt-6">
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / Dimensions.get('window').width
                  );
                  setActiveExerciseIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {currentLog.exercises.map((exercise, index) => {
                  const screenWidth = Dimensions.get('window').width;
                  const sidePadding = 16;

                  return (
                    <View
                      key={index}
                      style={{
                        width: screenWidth,
                        paddingLeft: index === 0 ? sidePadding : 0,
                        paddingRight:
                          index === currentLog.exercises.length - 1 ? sidePadding : 0,
                      }}
                    >
                      <ExerciseCard
                        exercise={exercise}
                        exerciseIndex={index}
                        onAddSet={addSet}
                        onEditSet={openSetEditor}
                        onRemoveSet={removeSet}
                      />
                    </View>
                  );
                })}
              </ScrollView>

              <View className="flex-row justify-center mt-3">
                {currentLog.exercises.map((_, idx) => (
                  <View
                    key={idx}
                    className={`w-2 h-2 mx-1 rounded-full ${
                      idx === activeExerciseIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </View>
            </View>

            <View className="h-24" />
          </>
        )}
      </ScrollView>

      <WorkoutActions
        isComplete={currentLog?.is_complete ?? false}
        saving={saving}
        onSave={saveProgress}
        onSubmit={submitWorkout}
      />

      <SetEditorModal
        editingSet={editingSet}
        onCancel={() => setEditingSet(null)}
        onChange={(newSet) =>
          setEditingSet((prev) => (prev ? { ...prev, set: newSet } : null))
        }
        onSave={saveSetEdit}
      />
    </View>
  );
}
