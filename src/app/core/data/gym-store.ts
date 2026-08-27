import { computed, inject, Injectable, signal } from '@angular/core';
import { BackupData, Exercise, WorkoutPlan, WorkoutSession } from '../domain/models';
import { SEED_EXERCISES, SEED_ROUTINE } from './seed-data';
import { ExerciseRepository, RoutineRepository, WorkoutRepository } from './repositories';

@Injectable({ providedIn: 'root' })
export class GymStore {
  private readonly exerciseRepository = inject(ExerciseRepository);
  private readonly routineRepository = inject(RoutineRepository);
  private readonly workoutRepository = inject(WorkoutRepository);

  readonly exercises = signal<Exercise[]>([]);
  readonly routine = signal<WorkoutPlan | null>(null);
  readonly sessions = signal<WorkoutSession[]>([]);
  readonly ready = signal(false);
  readonly exerciseMap = computed(() => new Map(this.exercises().map((item) => [item.id, item])));

  async initialize(): Promise<void> {
    const existingRoutine = await this.routineRepository.get();
    if (!existingRoutine) {
      await this.exerciseRepository.putAll(SEED_EXERCISES);
      await this.routineRepository.put(SEED_ROUTINE);
    }
    await this.reload();
    this.ready.set(true);
  }

  async reload(): Promise<void> {
    const [exercises, routine, sessions] = await Promise.all([
      this.exerciseRepository.getAll(), this.routineRepository.get(), this.workoutRepository.getAll(),
    ]);
    this.exercises.set(exercises.sort((a, b) => a.name.localeCompare(b.name, 'es')));
    this.routine.set(routine ?? SEED_ROUTINE);
    this.sessions.set(sessions);
  }

  async saveRoutine(routine: WorkoutPlan): Promise<void> {
    const updated = { ...routine, updatedAt: new Date().toISOString() };
    await this.routineRepository.put(updated);
    this.routine.set(updated);
  }

  async saveExercise(exercise: Exercise): Promise<void> {
    await this.exerciseRepository.put(exercise);
    this.exercises.update((items) => [...items.filter((item) => item.id !== exercise.id), exercise].sort((a, b) => a.name.localeCompare(b.name, 'es')));
  }

  async saveSession(session: WorkoutSession): Promise<void> {
    await this.workoutRepository.put(session);
    this.sessions.update((items) => [session, ...items.filter((item) => item.id !== session.id)]);
  }

  exportData(): BackupData {
    const routine = this.routine();
    if (!routine) throw new Error('La rutina todavía no está disponible');
    return { version: 1, exportedAt: new Date().toISOString(), exercises: this.exercises(), routine, sessions: this.sessions() };
  }

  async importData(data: BackupData): Promise<void> {
    if (data.version !== 1 || !Array.isArray(data.exercises) || !data.routine || !Array.isArray(data.sessions)) {
      throw new Error('El archivo no tiene un formato de copia válido');
    }
    await Promise.all([this.exerciseRepository.clear(), this.routineRepository.clear(), this.workoutRepository.clear()]);
    await this.exerciseRepository.putAll(data.exercises);
    await this.routineRepository.put(data.routine);
    for (const session of data.sessions) await this.workoutRepository.put(session);
    await this.reload();
  }
}
