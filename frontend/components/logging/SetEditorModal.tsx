import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SetLog } from '@/types/logging';

interface EditingSetInfo {
  setIndex: number;
  exerciseIndex: number;
  set: SetLog;
}

interface SetEditorModalProps {
  editingSet: EditingSetInfo | null;
  onChange: (updatedSet: SetLog) => void;
  onCancel: () => void;
  onSave: () => void;
}

const SetEditorModal: React.FC<SetEditorModalProps> = ({
  editingSet,
  onChange,
  onCancel,
  onSave,
}) => {
  if (!editingSet) return null;

  const { set } = editingSet;

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white p-6 rounded-lg w-80 max-w-full">
          <Text className="text-xl font-bold mb-4 text-center">
            Edit Set {set.set_number}
          </Text>

          {/* Weight */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Weight</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded text-center"
              value={set.weight.toString()}
              onChangeText={(text) =>
                onChange({ ...set, weight: parseFloat(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="Weight"
            />
          </View>

          {/* Reps */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Reps</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded text-center"
              value={set.reps.toString()}
              onChangeText={(text) =>
                onChange({ ...set, reps: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="Reps"
            />
          </View>

          {/* RPE */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">RPE (Optional)</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded text-center"
              value={set.rpe?.toString() || ''}
              onChangeText={(text) =>
                onChange({ ...set, rpe: text ? parseFloat(text) : undefined })
              }
              keyboardType="numeric"
              placeholder="Rate of Perceived Exertion (1-10)"
            />
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-2">Notes (Optional)</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded"
              value={set.notes || ''}
              onChangeText={(text) => onChange({ ...set, notes: text })}
              placeholder="Any notes about this set..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-500 p-3 rounded"
              onPress={onCancel}
            >
              <Text className="text-white text-center font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 p-3 rounded"
              onPress={onSave}
            >
              <Text className="text-white text-center font-medium">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SetEditorModal;
