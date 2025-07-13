//components/DayWorkout.jsx

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

//components/ExerciseCard.jsx
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

//components/ExerciseForm.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Target, AlertCircle } from 'lucide-react';

const ExerciseForm = ({ exercise, onClose }) => {
  const formSteps = [
    'Start with feet shoulder-width apart',
    'Keep your core engaged throughout',
    'Control the movement - slow and steady',
    'Focus on the target muscles working',
    'Breathe out during the exertion phase'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{exercise.name}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Target Muscles</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {exercise.targetMuscles.map((muscle, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="text-center text-gray-600 text-sm">
                Exercise Form Illustration
              </div>
              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mt-2 flex items-center justify-center">
                <span className="text-blue-600 text-sm">Form Guide Visual</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-700">Proper Form Steps</span>
            </div>
            <div className="space-y-2">
              {formSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Beginner Tip</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Start with lighter weights to master the form. Quality over quantity - perfect reps build strength safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExerciseForm;

//components/WeekOverview.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, CheckCircle } from 'lucide-react';

const WeekOverview = ({ workoutWeek, onDaySelect }) => {
  const getDayStatus = (day) => {
    if (day.type === 'rest') return 'rest';
    return day.completed ? 'completed' : 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'rest': return 'bg-gray-300 text-gray-600';
      default: return 'bg-blue-500 text-white hover:bg-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Week Overview</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {workoutWeek.map((day, index) => {
          const status = getDayStatus(day);
          return (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${getStatusColor(status)} ${status === 'rest' ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}`}
              onClick={() => status !== 'rest' && onDaySelect(day)}
            >
              <div className="text-center">
                <div className="text-sm font-medium mb-2">{day.dayName}</div>
                <div className="text-lg font-bold mb-2">{day.name}</div>
                <div className="text-xs opacity-80 mb-3">{day.description}</div>
                
                {status === 'completed' && (
                  <CheckCircle className="w-5 h-5 mx-auto" />
                )}
                {status === 'pending' && (
                  <Target className="w-5 h-5 mx-auto" />
                )}
                {status === 'rest' && (
                  <div className="text-xs">Rest Day</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">This Week's Focus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Upper Body Strength</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Lower Body Power</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekOverview;

//components/WorkoutLogger.jsx


import React, { useState } from 'react';
import WeekOverview from './WeekOverview';
import DayWorkout from './DayWorkout';
import { workoutWeek } from '../utils/workoutData';

const WorkoutLogger = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Workout Logger</h1>
          <p className="text-gray-600">Track your progress and build strength consistently</p>
        </div>
        
        {!selectedDay ? (
          <WeekOverview 
            workoutWeek={workoutWeek} 
            onDaySelect={setSelectedDay} 
          />
        ) : (
          <DayWorkout 
            day={selectedDay} 
            onBack={() => setSelectedDay(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default WorkoutLogger;

//utils/motion.js

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  };
  
  export const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };
  
  export const slideRight = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  };
  
  export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  };
  
  export const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  export const cardHover = {
    whileHover: {
      y: -4,
      transition: { duration: 0.2 }
    }
  };
  
  export const buttonPress = {
    whileTap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  //utils/workoutData.js

  export const workoutWeek = [
    {
      id: 1,
      dayName: 'Monday',
      name: 'Upper Day',
      type: 'workout',
      description: 'Hit entire upper body with compound movements',
      completed: false,
      exercises: [
        {
          id: 1,
          name: 'Dumbbell Incline Bench Press',
          targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        },
        {
          id: 2,
          name: 'Pull-ups',
          targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        },
        {
          id: 3,
          name: 'Overhead Press',
          targetMuscles: ['Shoulders', 'Triceps', 'Core'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        },
        {
          id: 4,
          name: 'Barbell Rows',
          targetMuscles: ['Lats', 'Rhomboids', 'Rear Delts'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        }
      ]
    },
    {
      id: 2,
      dayName: 'Tuesday',
      name: 'Lower Day',
      type: 'workout',
      description: 'Build powerful legs and glutes',
      completed: false,
      exercises: [
        {
          id: 5,
          name: 'Squats',
          targetMuscles: ['Quads', 'Glutes', 'Core'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        },
        {
          id: 6,
          name: 'Romanian Deadlifts',
          targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        },
        {
          id: 7,
          name: 'Bulgarian Split Squats',
          targetMuscles: ['Quads', 'Glutes', 'Calves'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        }
      ]
    },
    {
      id: 3,
      dayName: 'Wednesday',
      name: 'Rest Day',
      type: 'rest',
      description: 'Recovery and mobility work',
      completed: true,
      exercises: []
    },
    {
      id: 4,
      dayName: 'Thursday',
      name: 'Upper Day',
      type: 'workout',
      description: 'Focus on strength and muscle building',
      completed: false,
      exercises: [
        {
          id: 8,
          name: 'Bench Press',
          targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        },
        {
          id: 9,
          name: 'Lat Pulldowns',
          targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        }
      ]
    },
    {
      id: 5,
      dayName: 'Friday',
      name: 'Lower Day',
      type: 'workout',
      description: 'Power and explosive movements',
      completed: false,
      exercises: [
        {
          id: 10,
          name: 'Deadlifts',
          targetMuscles: ['Hamstrings', 'Glutes', 'Traps'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        },
        {
          id: 11,
          name: 'Leg Press',
          targetMuscles: ['Quads', 'Glutes'],
          sets: [
            { id: 1, reps: 0, weight: 0, completed: false },
            { id: 2, reps: 0, weight: 0, completed: false },
            { id: 3, reps: 0, weight: 0, completed: false }
          ]
        }
      ]
    },
    {
      id: 6,
      dayName: 'Saturday',
      name: 'Rest Day',
      type: 'rest',
      description: 'Active recovery and stretching',
      completed: true,
      exercises: []
    },
    {
      id: 7,
      dayName: 'Sunday',
      name: 'Rest Day',
      type: 'rest',
      description: 'Complete rest and preparation',
      completed: true,
      exercises: []
    }
  ];

  //apps.css
  #root {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.react:hover {
    filter: drop-shadow(0 0 2em #61dafbaa);
  }
  
  @keyframes logo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (prefers-reduced-motion: no-preference) {
    a:nth-of-type(2) .logo {
      animation: logo-spin infinite 20s linear;
    }
  }
  
  .card {
    padding: 2em;
  }
  
  .read-the-docs {
    color: #888;
  }

  //app.jsx
  import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkoutLogger from './components/WorkoutLogger';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<WorkoutLogger />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

