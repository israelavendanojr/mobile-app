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