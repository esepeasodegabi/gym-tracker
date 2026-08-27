import { ExercisePerformance, ExerciseSnapshot, SetPerformance, WorkoutSession } from './models';

export function completedSets(sets: SetPerformance[]): SetPerformance[] {
  return sets.filter((set) => set.completed && set.weight >= 0 && set.reps >= 0);
}

export function calculateVolume(sets: SetPerformance[]): number {
  return completedSets(sets).reduce((sum, set) => sum + set.weight * set.reps, 0);
}

export function calculateMaxWeight(sets: SetPerformance[]): number {
  return Math.max(0, ...completedSets(sets).map((set) => set.weight));
}

export function calculateTotalReps(sets: SetPerformance[]): number {
  return completedSets(sets).reduce((sum, set) => sum + set.reps, 0);
}

export function findLastPerformance(
  sessions: WorkoutSession[],
  exerciseId: string,
  beforeDate?: string,
): { session: WorkoutSession; performance: ExercisePerformance } | undefined {
  return [...sessions]
    .filter((session) => !beforeDate || session.date < beforeDate)
    .sort((a, b) => (b.completedAt ?? b.date).localeCompare(a.completedAt ?? a.date))
    .map((session) => ({
      session,
      performance: session.exercises.find((item) => item.exerciseId === exerciseId),
    }))
    .find(
      (item): item is { session: WorkoutSession; performance: ExercisePerformance } =>
        Boolean(item.performance),
    );
}

export function proposeSets(
  last: ExercisePerformance | undefined,
  recommendedSets: number,
  recommendedReps: number,
  recommendedWeight: number,
): SetPerformance[] {
  if (last?.sets.length) {
    return last.sets.map((set) => ({ ...set, completed: false }));
  }
  return Array.from({ length: recommendedSets }, () => ({
    weight: recommendedWeight,
    reps: recommendedReps,
    completed: false,
  }));
}

export function isNewRecord(
  current: ExercisePerformance,
  previousSessions: WorkoutSession[],
): boolean {
  const currentWeight = calculateMaxWeight(current.sets);
  const currentVolume = calculateVolume(current.sets);
  const previous = previousSessions
    .flatMap((session) => session.exercises)
    .filter((item) => item.exerciseId === current.exerciseId);
  if (!previous.length) return false;
  const bestWeight = Math.max(...previous.map((item) => calculateMaxWeight(item.sets)));
  const bestVolume = Math.max(...previous.map((item) => calculateVolume(item.sets)));
  return currentWeight > bestWeight || currentVolume > bestVolume;
}

export function exerciseSnapshots(
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseSnapshot[] {
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((session) => {
      const performance = session.exercises.find((item) => item.exerciseId === exerciseId);
      return performance
        ? [
            {
              date: session.date,
              maxWeight: calculateMaxWeight(performance.sets),
              volume: calculateVolume(performance.sets),
              totalReps: calculateTotalReps(performance.sets),
              sets: performance.sets,
            },
          ]
        : [];
    });
}
