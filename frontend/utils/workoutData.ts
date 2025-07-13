import { WorkoutData } from '../types/workout';

// Mock workout data
export const workoutData: WorkoutData = {
  currentWeek: [
    {
      id: 1,
      dayName: 'Monday',
      name: 'Push Day',
      description: 'Chest, Shoulders, Triceps',
      type: 'workout',
      completed: false,
      exercises: [
        {
          id: 1,
          name: 'Bench Press',
          targetMuscles: ['Chest', 'Triceps'],
          sets: [
            { id: 1, reps: 8, weight: 185, completed: false },
            { id: 2, reps: 6, weight: 195, completed: false },
            { id: 3, reps: 4, weight: 205, completed: false }
          ]
        },
        {
          id: 2,
          name: 'Overhead Press',
          targetMuscles: ['Shoulders', 'Triceps'],
          sets: [
            { id: 1, reps: 8, weight: 95, completed: false },
            { id: 2, reps: 6, weight: 105, completed: false },
            { id: 3, reps: 4, weight: 115, completed: false }
          ]
        },
        {
          id: 3,
          name: 'Incline Dumbbell Press',
          targetMuscles: ['Upper Chest', 'Shoulders'],
          sets: [
            { id: 1, reps: 10, weight: 70, completed: false },
            { id: 2, reps: 8, weight: 75, completed: false },
            { id: 3, reps: 6, weight: 80, completed: false }
          ]
        }
      ]
    },
    {
      id: 2,
      dayName: 'Tuesday',
      name: 'Pull Day',
      description: 'Back, Biceps, Rear Delts',
      type: 'workout',
      completed: false,
      exercises: [
        {
          id: 4,
          name: 'Deadlift',
          targetMuscles: ['Back', 'Hamstrings'],
          sets: [
            { id: 1, reps: 5, weight: 225, completed: false },
            { id: 2, reps: 3, weight: 245, completed: false },
            { id: 3, reps: 1, weight: 265, completed: false }
          ]
        },
        {
          id: 5,
          name: 'Pull-ups',
          targetMuscles: ['Lats', 'Biceps'],
          sets: [
            { id: 1, reps: 8, weight: 0, completed: false },
            { id: 2, reps: 6, weight: 0, completed: false },
            { id: 3, reps: 4, weight: 0, completed: false }
          ]
        }
      ]
    },
    {
      id: 3,
      dayName: 'Wednesday',
      name: 'Rest Day',
      description: 'Active Recovery',
      type: 'rest',
      completed: false
    },
    {
      id: 4,
      dayName: 'Thursday',
      name: 'Legs',
      description: 'Quads, Glutes, Hamstrings',
      type: 'workout',
      completed: true,
      exercises: [
        {
          id: 6,
          name: 'Squat',
          targetMuscles: ['Quads', 'Glutes'],
          sets: [
            { id: 1, reps: 8, weight: 185, completed: true },
            { id: 2, reps: 6, weight: 205, completed: true },
            { id: 3, reps: 4, weight: 225, completed: true }
          ]
        }
      ]
    },
    {
      id: 5,
      dayName: 'Friday',
      name: 'Push Day',
      description: 'Chest, Shoulders, Triceps',
      type: 'workout',
      completed: false,
      exercises: []
    },
    {
      id: 6,
      dayName: 'Saturday',
      name: 'Pull Day',
      description: 'Back, Biceps, Rear Delts',
      type: 'workout',
      completed: false,
      exercises: []
    },
    {
      id: 7,
      dayName: 'Sunday',
      name: 'Rest Day',
      description: 'Complete Rest',
      type: 'rest',
      completed: false
    }
  ],
  plans: [
    {
      id: 1,
      name: 'Push Pull Legs',
      description: 'Classic 6-day split focusing on compound movements',
      duration: '12 weeks',
      difficulty: 'Intermediate',
      goals: ['Strength', 'Muscle Growth'],
      daysPerWeek: 6
    },
    {
      id: 2,
      name: 'Upper Lower Split',
      description: '4-day split alternating upper and lower body',
      duration: '8 weeks',
      difficulty: 'Beginner',
      goals: ['Strength', 'Conditioning'],
      daysPerWeek: 4
    },
    {
      id: 3,
      name: 'Full Body',
      description: 'Total body workout 3x per week',
      duration: '6 weeks',
      difficulty: 'Beginner',
      goals: ['General Fitness', 'Fat Loss'],
      daysPerWeek: 3
    }
  ],
  currentWeekNumber: 1
};

export default workoutData;