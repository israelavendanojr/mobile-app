import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface WorkoutActionsProps {
    isComplete: boolean;
    saving: boolean;
    onSave: () => void;
    onSubmit: () => void;
}
  
  const WorkoutActions: React.FC<WorkoutActionsProps> = ({
    isComplete,
    saving,
    onSave,
    onSubmit,
  }) => (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
      <View className="flex-row space-x-3">
        <TouchableOpacity
          className="flex-1 bg-gray-100 py-4 rounded-xl"
          onPress={onSave}
          disabled={saving}
        >
          <Text className="text-gray-700 text-center font-semibold">
            {saving ? 'Saving...' : 'Save Progress'}
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl ${
            isComplete ? 'bg-green-100' : 'bg-green-500'
          }`}
          onPress={onSubmit}
          disabled={saving || isComplete}
        >
          <Text
            className={`text-center font-semibold ${
              isComplete ? 'text-green-700' : 'text-white'
            }`}
          >
            {isComplete ? 'Completed ✓' : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  export default WorkoutActions;
  