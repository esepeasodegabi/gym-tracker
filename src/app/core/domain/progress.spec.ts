import { describe, expect, it } from 'vitest';
import { ExercisePerformance, WorkoutSession } from './models';
import { calculateVolume, findLastPerformance, isNewRecord, proposeSets } from './progress';

const performance = (exerciseId: string, weight: number, reps: number): ExercisePerformance => ({
  exerciseId,
  sets: [{ weight, reps, completed: true }, { weight, reps: reps - 1, completed: true }],
});

const session = (id: string, date: string, item: ExercisePerformance): WorkoutSession => ({
  id, date, day: 1, title: 'Pecho', exercises: [item], completedAt: `${date}T18:00:00.000Z`,
});

describe('lógica de progreso', () => {
  it('calcula el volumen usando solo series completadas', () => {
    expect(calculateVolume([
      { weight: 50, reps: 10, completed: true },
      { weight: 50, reps: 8, completed: true },
      { weight: 60, reps: 12, completed: false },
    ])).toBe(900);
  });

  it('recupera la sesión más reciente de un ejercicio', () => {
    const sessions = [session('old', '2026-08-10', performance('press', 40, 10)), session('new', '2026-08-24', performance('press', 50, 10))];
    expect(findLastPerformance(sessions, 'press')?.session.id).toBe('new');
  });

  it('puede recuperar la sesión previa a una fecha', () => {
    const sessions = [session('one', '2026-08-10', performance('press', 40, 10)), session('two', '2026-08-24', performance('press', 50, 10))];
    expect(findLastPerformance(sessions, 'press', '2026-08-20')?.session.id).toBe('one');
  });

  it('propone exactamente los valores anteriores, pendientes de completar', () => {
    const previous = performance('press', 52.5, 10);
    expect(proposeSets(previous, 3, 12, 40)).toEqual(previous.sets.map((set) => ({ ...set, completed: false })));
  });

  it('usa la recomendación cuando no existe sesión anterior', () => {
    expect(proposeSets(undefined, 3, 12, 20)).toEqual(Array.from({ length: 3 }, () => ({ weight: 20, reps: 12, completed: false })));
  });

  it('detecta un récord por peso o volumen y evita premiar la primera sesión', () => {
    const previous = [session('one', '2026-08-10', performance('press', 50, 10))];
    expect(isNewRecord(performance('press', 52.5, 8), previous)).toBe(true);
    expect(isNewRecord(performance('press', 40, 8), previous)).toBe(false);
    expect(isNewRecord(performance('press', 50, 10), [])).toBe(false);
  });
});
