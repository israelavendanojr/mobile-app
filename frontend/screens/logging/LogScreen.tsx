import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { router } from 'expo-router';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

interface SetLog {
  id?: number;
  set_number: number;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
  source: 'manual' | 'auto';
}

interface ExerciseLog {
  id?: number;
  name: string;
  target_sets: number;
  target_reps: number;
  sets: SetLog[];
}

interface WorkoutLog {
  id?: number;
  date: string;
  is_complete: boolean;
  workout_day?: {
    day_name: string;
    order: number;
  };
  exercises: ExerciseLog[];
}

interface WeekDay {
  date: string;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  workoutLog?: WorkoutLog;
}

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
      workoutLog: updatedLog
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

      if (isToday) {
        todayIndex = i;
      }

      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        isPast: date < today && !isToday,
        isFuture: date > today,
        workoutLog: undefined
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
          workoutLog: matchedLog
            ? {
                ...matchedLog,
                is_complete: matchedLog.is_complete,
                workout_day: matchedLog.workout_day,
                exercises: matchedLog.exercises,
                id: matchedLog.id
              }
            : undefined
        };
      });

      setWeekDays(days);
      setSelectedDayIndex(days.findIndex(d => d.isToday));
    } catch (err) {
      console.error('Failed to load week log:', err);
      setError('Could not load weekly workout log.');
    } finally {
      setLoading(false);
    }
  };

  const selectDay = async (dayIndex: number) => {
    if (dayIndex === selectedDayIndex) return;
    setSelectedDayIndex(dayIndex);
  };

  const addSet = (exerciseIndex: number) => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    const updatedLog = { ...currentLog };
    const exercise = updatedLog.exercises[exerciseIndex];
    
    const lastSetNumber = exercise.sets.length > 0 
      ? Math.max(...exercise.sets.map(s => s.set_number))
      : 0;
    
    const newSet: SetLog = {
      set_number: lastSetNumber + 1,
      weight: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].weight : 0,
      reps: exercise.target_reps,
      rpe: undefined,
      notes: '',
      source: 'manual'
    };

    exercise.sets.push(newSet);
    updateCurrentWorkoutLog(updatedLog);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    Alert.alert(
      'Remove Set',
      'Are you sure you want to remove this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const updatedLog = { ...currentLog };
            updatedLog.exercises[exerciseIndex].sets.splice(setIndex, 1);
            
            // Renumber the remaining sets
            updatedLog.exercises[exerciseIndex].sets.forEach((set, idx) => {
              set.set_number = idx + 1;
            });
            
            updateCurrentWorkoutLog(updatedLog);
          }
        },
      ]
    );
  };

  const openSetEditor = (exerciseIndex: number, setIndex: number) => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;
    
    const set = currentLog.exercises[exerciseIndex].sets[setIndex];
    setEditingSet({
      exerciseIndex,
      setIndex,
      set: { ...set }
    });
  };

  const saveSetEdit = () => {
    const currentLog = getCurrentWorkoutLog();
    if (!editingSet || !currentLog) return;

    const updatedLog = { ...currentLog };
    updatedLog.exercises[editingSet.exerciseIndex].sets[editingSet.setIndex] = editingSet.set;
    
    updateCurrentWorkoutLog(updatedLog);
    setEditingSet(null);
  };

  const submitWorkout = async () => {
    const currentLog = getCurrentWorkoutLog();
    if (!currentLog) return;

    Alert.alert(
      'Complete Workout',
      'Are you sure you want to mark this workout as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: async () => {
            try {
              setSaving(true);
              
              const submitData = {
                ...currentLog,
                is_complete: true
              };

              await api.post(`/api/workout/log/day/${currentLog.id}/submit/`, submitData);
              
              // Update the local state
              updateCurrentWorkoutLog(submitData);
              
              Alert.alert(
                'Workout Completed!',
                'Great job! Your workout has been logged successfully.'
              );
            } catch (err: any) {
              console.error('Error submitting workout:', err);
              Alert.alert(
                'Error',
                err.response?.data?.error || 'Failed to submit workout'
              );
            } finally {
              setSaving(false);
            }
          }
        },
      ]
    );
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
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Failed to save progress'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderWeekNavigation = () => {
    return (
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {weekDays.map((day, index) => {
              const isSelected = index === selectedDayIndex;
              const hasWorkout = !!day.workoutLog;
              const isComplete = day.workoutLog?.is_complete;
              
              return (
                <TouchableOpacity
                  key={day.date}
                  className={`px-4 py-3 rounded-lg min-w-20 ${
                    isSelected 
                      ? 'bg-blue-500' 
                      : hasWorkout 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                  onPress={() => selectDay(index)}
                >
                  <Text className={`text-center font-medium ${
                    isSelected 
                      ? 'text-white' 
                      : hasWorkout 
                        ? 'text-green-700' 
                        : 'text-gray-600'
                  }`}>
                    {day.dayName}
                  </Text>
                  <Text className={`text-center text-sm ${
                    isSelected 
                      ? 'text-blue-100' 
                      : 'text-gray-500'
                  }`}>
                    {new Date(day.date).getDate()}
                  </Text>
                  {day.isToday && (
                    <View className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                  )}
                  {hasWorkout && (
                    <View className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                      isComplete ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderSetEditor = () => {
    if (!editingSet) return null;

    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingSet(null)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-80 max-w-full">
            <Text className="text-xl font-bold mb-4 text-center">
              Edit Set {editingSet.set.set_number}
            </Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Weight</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded text-center"
                value={editingSet.set.weight.toString()}
                onChangeText={(text) => setEditingSet(prev => prev ? {
                  ...prev,
                  set: { ...prev.set, weight: parseFloat(text) || 0 }
                } : null)}
                keyboardType="numeric"
                placeholder="Weight"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Reps</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded text-center"
                value={editingSet.set.reps.toString()}
                onChangeText={(text) => setEditingSet(prev => prev ? {
                  ...prev,
                  set: { ...prev.set, reps: parseInt(text) || 0 }
                } : null)}
                keyboardType="numeric"
                placeholder="Reps"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">RPE (Optional)</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded text-center"
                value={editingSet.set.rpe?.toString() || ''}
                onChangeText={(text) => setEditingSet(prev => prev ? {
                  ...prev,
                  set: { ...prev.set, rpe: text ? parseFloat(text) : undefined }
                } : null)}
                keyboardType="numeric"
                placeholder="Rate of Perceived Exertion (1-10)"
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Notes (Optional)</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded"
                value={editingSet.set.notes || ''}
                onChangeText={(text) => setEditingSet(prev => prev ? {
                  ...prev,
                  set: { ...prev.set, notes: text }
                } : null)}
                placeholder="Any notes about this set..."
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-500 p-3 rounded"
                onPress={() => setEditingSet(null)}
              >
                <Text className="text-white text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-500 p-3 rounded"
                onPress={saveSetEdit}
              >
                <Text className="text-white text-center font-medium">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSet = (set: SetLog, setIndex: number, exerciseIndex: number) => {
    return (
      <TouchableOpacity
        key={setIndex}
        className="flex-row items-center justify-between bg-white p-3 rounded-lg mb-2 border border-gray-200"
        onPress={() => openSetEditor(exerciseIndex, setIndex)}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-lg font-semibold text-gray-800 w-12">
            {set.set_number}
          </Text>
          <Text className="text-lg text-gray-700 flex-1 text-center">
            {set.weight}lbs × {set.reps} reps
          </Text>
          {set.rpe && (
            <Text className="text-sm text-gray-500 ml-2">
              RPE: {set.rpe}
            </Text>
          )}
        </View>
        <TouchableOpacity
          className="ml-4 p-2"
          onPress={() => removeSet(exerciseIndex, setIndex)}
        >
          <Text className="text-red-500 font-bold">×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderExercise = (exercise: ExerciseLog, exerciseIndex: number) => {
    const completedSets = exercise.sets.length;
    const targetSets = exercise.target_sets;
    
    return (
      <View key={exerciseIndex} className="mb-6">
        <View className="bg-gray-50 p-4 rounded-lg mb-3">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {exercise.name}
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">
              Target: {targetSets} sets × {exercise.target_reps} reps
            </Text>
            <Text className={`font-medium ${
              completedSets >= targetSets ? 'text-green-600' : 'text-orange-600'
            }`}>
              {completedSets}/{targetSets} sets
            </Text>
          </View>
        </View>

        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-700">Sets</Text>
            <Text className="text-sm text-gray-500">Set | Weight × Reps</Text>
          </View>
          
          {exercise.sets.map((set, setIndex) => 
            renderSet(set, setIndex, exerciseIndex)
          )}
        </View>

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg"
          onPress={() => addSet(exerciseIndex)}
        >
          <Text className="text-white text-center font-medium">
            + Add Set
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWorkoutContent = () => {
    const currentLog = getCurrentWorkoutLog();
    const selectedDay = weekDays[selectedDayIndex];
    
    if (!selectedDay) return null;

    if (selectedDay.isFuture) {
      return (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-gray-500 text-lg text-center">
            This workout is scheduled for the future.
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Come back on {selectedDay.dayName} to log your workout!
          </Text>
        </View>
      );
    }

    if (!currentLog) {
      return (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-gray-500 text-lg text-center mb-4">
            No workout logged for {selectedDay.dayName}
          </Text>
          {selectedDay.isToday && (
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-lg"
              onPress={() => {
                // This would trigger creating a new workout log
                // You might want to add this functionality
              }}
            >
              <Text className="text-white font-medium">Start Today's Workout</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 px-6 py-4">
        {currentLog.exercises.map((exercise, index) => 
          renderExercise(exercise, index)
        )}
      </ScrollView>
    );
  };

  const renderActionButtons = () => {
    const currentLog = getCurrentWorkoutLog();
    const selectedDay = weekDays[selectedDayIndex];
    
    if (!currentLog || selectedDay?.isFuture) {
      return null;
    }

    return (
      <View className="bg-white border-t border-gray-200 px-6 py-4 space-y-3">
        <TouchableOpacity
          className="bg-gray-500 p-4 rounded-lg"
          onPress={saveProgress}
          disabled={saving}
        >
          <Text className="text-white text-center font-medium text-lg">
            {saving ? 'Saving...' : 'Save Progress'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-green-500 p-4 rounded-lg"
          onPress={submitWorkout}
          disabled={saving || currentLog.is_complete}
        >
          <Text className="text-white text-center font-medium text-lg">
            {currentLog.is_complete ? 'Workout Completed' : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    );
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

  const selectedDay = weekDays[selectedDayIndex];
  const currentLog = getCurrentWorkoutLog();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900">
          Weekly Workout Log
        </Text>
        {selectedDay && (
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-600">
              {selectedDay.dayName}, {new Date(selectedDay.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}
              {selectedDay.isToday && ' (Today)'}
            </Text>
            {currentLog && (
              <View className="flex-row items-center space-x-2">
                <View className={`w-3 h-3 rounded-full ${
                  currentLog.is_complete ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <Text className={`text-sm font-medium ${
                  currentLog.is_complete ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {currentLog.is_complete ? 'Complete' : 'In Progress'}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Week Navigation */}
      {renderWeekNavigation()}

      {/* Workout Content */}
      {renderWorkoutContent()}

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Set Editor Modal */}
      {renderSetEditor()}
    </View>
  );
}