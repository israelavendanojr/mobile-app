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

export default function WorkoutLogScreen() {
  const { authState } = useAuth();
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<{
    exerciseIndex: number;
    setIndex: number;
    set: SetLog;
  } | null>(null);

  useEffect(() => {
    fetchTodayLog();
  }, []);

  const fetchTodayLog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/workout/log/');
      setWorkoutLog(response.data);
    } catch (err: any) {
      console.error('Error fetching workout log:', err);
      setError(err.response?.data?.error || 'Failed to fetch workout log');
    } finally {
      setLoading(false);
    }
  };

  const addSet = (exerciseIndex: number) => {
    if (!workoutLog) return;

    const updatedLog = { ...workoutLog };
    const exercise = updatedLog.exercises[exerciseIndex];
    
    // Find the last set to get the next set number
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
    setWorkoutLog(updatedLog);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (!workoutLog) return;

    Alert.alert(
      'Remove Set',
      'Are you sure you want to remove this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const updatedLog = { ...workoutLog };
            updatedLog.exercises[exerciseIndex].sets.splice(setIndex, 1);
            
            // Renumber the remaining sets
            updatedLog.exercises[exerciseIndex].sets.forEach((set, idx) => {
              set.set_number = idx + 1;
            });
            
            setWorkoutLog(updatedLog);
          }
        },
      ]
    );
  };

  const openSetEditor = (exerciseIndex: number, setIndex: number) => {
    if (!workoutLog) return;
    
    const set = workoutLog.exercises[exerciseIndex].sets[setIndex];
    setEditingSet({
      exerciseIndex,
      setIndex,
      set: { ...set }
    });
  };

  const saveSetEdit = () => {
    if (!editingSet || !workoutLog) return;

    const updatedLog = { ...workoutLog };
    updatedLog.exercises[editingSet.exerciseIndex].sets[editingSet.setIndex] = editingSet.set;
    
    setWorkoutLog(updatedLog);
    setEditingSet(null);
  };

  const submitWorkout = async () => {
    if (!workoutLog) return;

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
                ...workoutLog,
                is_complete: true
              };

              await api.post('/api/workout/log/submit/', submitData);
              
              Alert.alert(
                'Workout Completed!',
                'Great job! Your workout has been logged successfully.',
                [
                  { text: 'OK', onPress: () => router.back() }
                ]
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
    if (!workoutLog) return;

    try {
      setSaving(true);
      
      await api.post('/api/workout/log/submit/', workoutLog);
      
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading today's workout...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-red-600 text-center mb-4 text-lg">{error}</Text>
        <TouchableOpacity
          onPress={fetchTodayLog}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!workoutLog) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-gray-600 text-center mb-4 text-lg">
          No workout found for today
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const targetSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.target_sets, 0);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900">
          {workoutLog.workout_day?.day_name || 'Today\'s Workout'}
        </Text>
        <Text className="text-gray-600 mt-1">
          {new Date(workoutLog.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm text-gray-500">
            Progress: {totalSets}/{targetSets} sets
          </Text>
          <View className="flex-row space-x-2">
            <View className={`w-3 h-3 rounded-full ${
              workoutLog.is_complete ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <Text className={`text-sm font-medium ${
              workoutLog.is_complete ? 'text-green-600' : 'text-gray-500'
            }`}>
              {workoutLog.is_complete ? 'Complete' : 'In Progress'}
            </Text>
          </View>
        </View>
      </View>

      {/* Workout Content */}
      <ScrollView className="flex-1 px-6 py-4">
        {workoutLog.exercises.map((exercise, index) => 
          renderExercise(exercise, index)
        )}
      </ScrollView>

      {/* Action Buttons */}
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
          disabled={saving || workoutLog.is_complete}
        >
          <Text className="text-white text-center font-medium text-lg">
            {workoutLog.is_complete ? 'Workout Completed' : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderSetEditor()}
    </View>
  );
}