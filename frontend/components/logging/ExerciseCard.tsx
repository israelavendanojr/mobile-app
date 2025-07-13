import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Plus, Minus } from 'lucide-react';
import ExerciseForm from './ExerciseForm';

const ExerciseCard = ({ exercise, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [sets, setSets] = useState(exercise.sets || [
    { id: 1, reps: 0, weight: 0, completed: false },
    { id: 2, reps: 0, weight: 0, completed: false },
    { id: 3, reps: 0, weight: 0, completed: false }
  ]);

  const updateSet = (setId, field, value) => {
    const updatedSets = sets.map(set => 
      set.id === setId ? { ...set, [field]: value } : set
    );
    setSets(updatedSets);
    onUpdate({ sets: updatedSets });
  };

  const toggleSetComplete = (setId) => {
    const updatedSets = sets.map(set => 
      set.id === setId ? { ...set, completed: !set.completed } : set
    );
    setSets(updatedSets);
    onUpdate({ sets: updatedSets });
  };

  const addSet = () => {
    const newSet = {
      id: sets.length + 1,
      reps: 0,
      weight: 0,
      completed: false
    };
    const updatedSets = [...sets, newSet];
    setSets(updatedSets);
    onUpdate({ sets: updatedSets });
  };

  const removeSet = () => {
    if (sets.length > 1) {
      const updatedSets = sets.slice(0, -1);
      setSets(updatedSets);
      onUpdate({ sets: updatedSets });
    }
  };

  const completedSets = sets.filter(set => set.completed).length;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ width: '320px' }}
      whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-sm">{exercise.name}</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {exercise.targetMuscles.map((muscle, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Info className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progress: {completedSets}/{sets.length} sets</span>
            <span>{Math.round((completedSets / sets.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completedSets / sets.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Sets & Reps</span>
            <div className="flex gap-1">
              <button
                onClick={removeSet}
                className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                disabled={sets.length <= 1}
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={addSet}
                className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {sets.map((set, index) => (
            <div key={set.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-6">{index + 1}</span>
              <input
                type="number"
                placeholder="Reps"
                value={set.reps || ''}
                onChange={(e) => updateSet(set.id, 'reps', parseInt(e.target.value) || 0)}
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-gray-400">×</span>
              <input
                type="number"
                placeholder="lbs"
                value={set.weight || ''}
                onChange={(e) => updateSet(set.id, 'weight', parseInt(e.target.value) || 0)}
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => toggleSetComplete(set.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  set.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {set.completed && <span className="text-xs">✓</span>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <ExerciseForm
          exercise={exercise}
          onClose={() => setShowForm(false)}
        />
      )}
    </motion.div>
  );
};

export default ExerciseCard;