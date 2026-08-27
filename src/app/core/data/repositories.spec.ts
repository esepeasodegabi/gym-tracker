import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExerciseRepository, RoutineRepository, WorkoutRepository } from './repositories';
import { gymDatabase } from './database';

describe('repositorios IndexedDB', () => {
  beforeEach(async () => {
    const database = await gymDatabase();
    await Promise.all(['exercises', 'routines', 'sessions'].map((store) => database.clear(store as 'exercises')));
  });

  it('guarda y recupera ejercicios', async () => {
    const repository = new ExerciseRepository();
    await repository.put({ id: 'press', name: 'Press banca', muscleGroup: 'Pecho' });
    expect(await repository.getAll()).toEqual([{ id: 'press', name: 'Press banca', muscleGroup: 'Pecho' }]);
  });

  it('mantiene la rutina principal', async () => {
    const repository = new RoutineRepository();
    const routine = { id: 'main' as const, name: 'Rutina', days: [], updatedAt: '2026-08-27' };
    await repository.put(routine);
    expect(await repository.get()).toEqual(routine);
  });

  it('ordena las sesiones desde la más reciente', async () => {
    const repository = new WorkoutRepository();
    await repository.put({ id: 'old', date: '2026-08-01', day: 1, title: 'A', exercises: [] });
    await repository.put({ id: 'new', date: '2026-08-27', day: 4, title: 'B', exercises: [] });
    expect((await repository.getAll()).map((item) => item.id)).toEqual(['new', 'old']);
  });
});
