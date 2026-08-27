export type DayId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  notes?: string;
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  order: number;
  recommendedSets: number;
  recommendedReps: number;
  recommendedWeight: number;
  restSeconds?: number;
  notes?: string;
}

export interface WorkoutDay {
  day: DayId;
  title: string;
  exercises: PlannedExercise[];
}

export interface WorkoutPlan {
  id: 'main';
  name: string;
  days: WorkoutDay[];
  updatedAt: string;
}

export interface SetPerformance {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExercisePerformance {
  exerciseId: string;
  plannedExerciseId?: string;
  sets: SetPerformance[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  day: DayId;
  title: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  exercises: ExercisePerformance[];
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  exercises: Exercise[];
  routine: WorkoutPlan;
  sessions: WorkoutSession[];
}

export interface ExerciseSnapshot {
  date: string;
  maxWeight: number;
  volume: number;
  totalReps: number;
  sets: SetPerformance[];
}
