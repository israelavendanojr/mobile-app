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