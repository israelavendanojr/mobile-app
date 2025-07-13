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