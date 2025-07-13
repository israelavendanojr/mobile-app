export interface ExerciseSet {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  targetMuscles: string[];
  sets: ExerciseSet[];
}

export interface WorkoutDay {
  id: number;
  dayName: string;
  name: string;
  description: string;
  type: 'workout' | 'rest';
  completed: boolean;
  exercises?: Exercise[];
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  goals: string[];
  daysPerWeek: number;
  duration: string;
}

export interface WorkoutData {
  currentWeek: WorkoutDay[];
  currentWeekNumber: number;
  plans: Plan[];
}
