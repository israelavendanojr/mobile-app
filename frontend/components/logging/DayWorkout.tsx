import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Clock, Zap } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import { workoutWeek } from '../utils/workoutData';

const DayWorkout = ({ day, onBack }) => {
  const [exercises, setExercises] = useState(day.exercises);

  const updateExercise = (exerciseId, updatedData) => {
    setExercises(prev => 
      prev.map(ex => ex.id === exerciseId ? { ...ex, ...updatedData } : ex)
    );
  };

  const completedExercises = exercises.filter(ex => ex.sets.some(set => set.reps > 0)).length;
  const progressPercentage = (completedExercises / exercises.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{day.name}</h1>
          <p className="text-gray-600 mt-1">{day.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">{exercises.length} Exercises</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">45-60 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Today's Exercises</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <ExerciseCard
                  exercise={exercise}
                  onUpdate={(data) => updateExercise(exercise.id, data)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3">Pro Tips for {day.name}</h4>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">• Focus on controlled movements and proper form</p>
          <p className="text-sm text-gray-600">• Rest 60-90 seconds between sets for strength</p>
          <p className="text-sm text-gray-600">• Track your weights to ensure progressive overload</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DayWorkout;