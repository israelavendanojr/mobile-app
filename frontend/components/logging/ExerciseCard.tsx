import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Plus, Minus, Info } from 'lucide-react-native';
import { Exercise } from '../../types/workout';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (updatedExercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [sets, setSets] = useState(exercise.sets || []);

  const updateSet = (setId: number, field: string, value: any) => {
    const updatedSets = sets.map((set) =>
      set.id === setId ? { ...set, [field]: value } : set
    );
    setSets(updatedSets);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const toggleSetComplete = (setId: number) => {
    const updatedSets = sets.map((set) =>
      set.id === setId ? { ...set, completed: !set.completed } : set
    );
    setSets(updatedSets);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const addSet = () => {
    const newSet = {
      id: sets.length > 0 ? Math.max(...sets.map((s) => s.id)) + 1 : 1,
      reps: 0,
      weight: 0,
      completed: false,
    };
    const updatedSets = [...sets, newSet];
    setSets(updatedSets);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const removeSet = () => {
    if (sets.length > 1) {
      const updatedSets = sets.slice(0, -1);
      setSets(updatedSets);
      onUpdate({ ...exercise, sets: updatedSets });
    }
  };

  const completedSets = sets.filter((set) => set.completed).length;

  return (
    <View className="bg-white rounded-xl border border-gray-200 shadow-sm w-80 overflow-hidden">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="font-semibold text-gray-800 text-sm">{exercise.name}</Text>
            <View className="flex-row flex-wrap gap-1 mt-1">
              {exercise.targetMuscles.map((muscle, idx) => (
                <Text
                  key={idx}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  {muscle}
                </Text>
              ))}
            </View>
          </View>
          <Pressable
            onPress={() => setShowForm(!showForm)}
            className="p-1 rounded-full"
          >
            <Info size={16} className="text-gray-500" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-gray-600">
              Progress: {completedSets}/{sets.length} sets
            </Text>
            <Text className="text-xs text-gray-600">
              {sets.length > 0 ? Math.round((completedSets / sets.length) * 100) : 0}%
            </Text>
          </View>
          <View className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <View
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(completedSets / sets.length) * 100 || 0}%` }}
            />
          </View>
        </View>

        {/* Set Controls */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xs font-medium text-gray-700">Sets & Reps</Text>
          <View className="flex-row gap-1">
            <Pressable
              onPress={removeSet}
              disabled={sets.length <= 1}
              className="p-1 rounded-full bg-red-100 disabled:opacity-50"
            >
              <Minus size={12} className="text-red-600" />
            </Pressable>
            <Pressable
              onPress={addSet}
              className="p-1 rounded-full bg-green-100"
            >
              <Plus size={12} className="text-green-600" />
            </Pressable>
          </View>
        </View>

        {/* Sets */}
        <View className="space-y-2">
          {sets.map((set, index) => (
            <View key={set.id} className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 w-5">{index + 1}</Text>
              <TextInput
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                keyboardType="numeric"
                placeholder="Reps"
                value={String(set.reps)}
                onChangeText={(val) => updateSet(set.id, 'reps', parseInt(val) || 0)}
              />
              <Text className="text-xs text-gray-400">×</Text>
              <TextInput
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                keyboardType="numeric"
                placeholder="lbs"
                value={String(set.weight)}
                onChangeText={(val) => updateSet(set.id, 'weight', parseInt(val) || 0)}
              />
              <Pressable
                onPress={() => toggleSetComplete(set.id)}
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  set.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}
              >
                {set.completed && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Exercise Form */}
      {showForm && (
        <View className="p-4 bg-gray-50 border-t border-gray-200">
          <Text className="text-sm text-gray-600">Exercise form would be displayed here.</Text>
        </View>
      )}
    </View>
  );
};

export default ExerciseCard;
