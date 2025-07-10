export interface SetLog {
    id?: number;
    set_number: number;
    weight: number;
    reps: number;
    rpe?: number;
    notes?: string;
    source: 'manual' | 'auto';
  }
  
  export interface ExerciseLog {
    id?: number;
    name: string;
    target_sets: number;
    target_reps: number;
    sets: SetLog[];
  }
  
  export interface WorkoutLog {
    id?: number;
    date: string;
    is_complete: boolean;
    workout_day?: {
      day_name: string;
      order: number;
    };
    exercises: ExerciseLog[];
  }
  
  export interface WeekDay {
    date: string;
    dayName: string;
    isToday: boolean;
    isPast: boolean;
    isFuture: boolean;
    workoutLog?: WorkoutLog;
  }
  