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