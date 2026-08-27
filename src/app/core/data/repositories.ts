import { Injectable } from '@angular/core';
import { Exercise, WorkoutPlan, WorkoutSession } from '../domain/models';
import { gymDatabase } from './database';

@Injectable({ providedIn: 'root' })
export class ExerciseRepository {
  async getAll(): Promise<Exercise[]> { return (await gymDatabase()).getAll('exercises'); }
  async put(exercise: Exercise): Promise<void> { await (await gymDatabase()).put('exercises', exercise); }
  async putAll(exercises: Exercise[]): Promise<void> {
    const transaction = (await gymDatabase()).transaction('exercises', 'readwrite');
    await Promise.all([...exercises.map((item) => transaction.store.put(item)), transaction.done]);
  }
  async clear(): Promise<void> { await (await gymDatabase()).clear('exercises'); }
}

@Injectable({ providedIn: 'root' })
export class RoutineRepository {
  async get(): Promise<WorkoutPlan | undefined> { return (await gymDatabase()).get('routines', 'main'); }
  async put(routine: WorkoutPlan): Promise<void> { await (await gymDatabase()).put('routines', routine); }
  async clear(): Promise<void> { await (await gymDatabase()).clear('routines'); }
}

@Injectable({ providedIn: 'root' })
export class WorkoutRepository {
  async getAll(): Promise<WorkoutSession[]> {
    const items = await (await gymDatabase()).getAllFromIndex('sessions', 'by-date');
    return items.sort((a, b) => (b.completedAt ?? b.date).localeCompare(a.completedAt ?? a.date));
  }
  async put(session: WorkoutSession): Promise<void> { await (await gymDatabase()).put('sessions', session); }
  async clear(): Promise<void> { await (await gymDatabase()).clear('sessions'); }
}
