import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput,
  Modal,
  Dimensions
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
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Week 3 (Sun. July 5)</Text>
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
                  onPress={() => selectDay(index)}
                >
                  <Text className={`text-xs font-medium ${
                    isSelected 
                      ? 'text-white' 
                      : hasWorkout 
                        ? 'text-green-700' 
                        : 'text-gray-600'
                  }`}>
                    {day.dayName}
                  </Text>
                  <Text className={`text-lg font-bold ${
                    isSelected 
                      ? 'text-white' 
                      : hasWorkout 
                        ? 'text-green-700' 
                        : 'text-gray-800'
                  }`}>
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

  const renderWorkoutDayCard = (workoutLog: WorkoutLog) => {
    const totalSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const targetSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
    const completionPercentage = targetSets > 0 ? Math.round((totalSets / targetSets) * 100) : 0;

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
              <View className={`px-3 py-1 rounded-full ${
                workoutLog.is_complete 
                  ? 'bg-green-100' 
                  : 'bg-blue-100'
              }`}>
                <Text className={`text-sm font-semibold ${
                  workoutLog.is_complete 
                    ? 'text-green-700' 
                    : 'text-blue-700'
                }`}>
                  {workoutLog.is_complete ? 'Complete' : 'In Progress'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-600">Progress</Text>
            <Text className="text-sm font-bold text-gray-900">{completionPercentage}%</Text>
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

  const renderExerciseCard = (exercise: ExerciseLog, exerciseIndex: number) => {
    const completedSets = exercise.sets.length;
    const targetSets = exercise.target_sets;
    const isComplete = completedSets >= targetSets;

    return (
      <View key={exerciseIndex} className="bg-white mx-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
        {/* Exercise Header */}
        <View className="px-6 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {exercise.name}
              </Text>
              <Text className="text-sm text-gray-500">
                Target: {targetSets} sets × {exercise.target_reps} reps
              </Text>
            </View>
            <View className="items-end">
              <View className={`px-3 py-1 rounded-full ${
                isComplete 
                  ? 'bg-green-100' 
                  : completedSets > 0 
                    ? 'bg-orange-100' 
                    : 'bg-gray-100'
              }`}>
                <Text className={`text-sm font-semibold ${
                  isComplete 
                    ? 'text-green-700' 
                    : completedSets > 0 
                      ? 'text-orange-700' 
                      : 'text-gray-600'
                }`}>
                  {completedSets}/{targetSets}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sets */}
        <View className="px-6 py-4">
          {exercise.sets.length > 0 ? (
            <View className="space-y-3">
              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} className="flex-row items-center bg-gray-50 rounded-xl p-4">
                  <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <Text className="text-sm font-bold text-white">{set.set_number}</Text>
                  </View>
                  
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-between"
                    onPress={() => openSetEditor(exerciseIndex, setIndex)}
                  >
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900">
                        {set.weight}lbs × {set.reps} reps
                      </Text>
                      {set.rpe && (
                        <Text className="text-sm text-gray-500 mt-1">
                          RPE: {set.rpe}/10
                        </Text>
                      )}
                    </View>
                    <View className="w-8 h-8 items-center justify-center">
                      <Text className="text-gray-400 text-lg">›</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="ml-3 w-8 h-8 items-center justify-center"
                    onPress={() => removeSet(exerciseIndex, setIndex)}
                  >
                    <Text className="text-red-500 text-xl font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-center mb-4">
                No sets logged yet
              </Text>
            </View>
          )}
        </View>

        {/* Add Set Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-xl flex-row items-center justify-center"
            onPress={() => addSet(exerciseIndex)}
          >
            <Text className="text-white font-semibold text-lg mr-2">+</Text>
            <Text className="text-white font-semibold text-lg">Add Set</Text>
          </TouchableOpacity>
        </View>
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
      <View className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Workout Day Card */}
          {renderWorkoutDayCard(currentLog)}

          {/* Exercise Cards */}
          <View className="mt-6">
            
          {/* Swipe Hint */}
          <Text className="text-sm text-gray-400 text-center mb-2">
            Swipe to view more exercises →
          </Text>

          {/* Horizontal ScrollView for exercises */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x /
                Dimensions.get('window').width
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
                    paddingRight: index === currentLog.exercises.length - 1 ? sidePadding : 0,
                  }}
                >
                  {renderExerciseCard(exercise, index)}
                </View>
              );
            })}
          </ScrollView>


          {/* Scroll indicator dots */}
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

          


          {/* Bottom padding for action buttons */}
          <View className="h-24" />
        </ScrollView>
      </View>
    );
  };

  const renderActionButtons = () => {
    const currentLog = getCurrentWorkoutLog();
    const selectedDay = weekDays[selectedDayIndex];
    
    if (!currentLog || selectedDay?.isFuture) {
      return null;
    }

    return (
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-4 rounded-xl"
            onPress={saveProgress}
            disabled={saving}
          >
            <Text className="text-gray-700 text-center font-semibold">
              {saving ? 'Saving...' : 'Save Progress'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-4 rounded-xl ${
              currentLog.is_complete 
                ? 'bg-green-100' 
                : 'bg-green-500'
            }`}
            onPress={submitWorkout}
            disabled={saving || currentLog.is_complete}
          >
            <Text className={`text-center font-semibold ${
              currentLog.is_complete 
                ? 'text-green-700' 
                : 'text-white'
            }`}>
              {currentLog.is_complete ? 'Completed ✓' : 'Complete Workout'}
            </Text>
          </TouchableOpacity>
        </View>
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

  return (
    <View className="flex-1 bg-gray-50">
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