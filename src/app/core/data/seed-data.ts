import { Exercise, PlannedExercise, WorkoutPlan } from '../domain/models';

const entries: [string, string][] = [
  ['Press banca', 'Pecho'], ['Press inclinado con mancuernas', 'Pecho'], ['Aperturas en máquina', 'Pecho'],
  ['Fondos asistidos', 'Pecho'], ['Flexiones', 'Pecho'], ['Jalón al pecho', 'Espalda'],
  ['Remo sentado', 'Espalda'], ['Remo con mancuerna', 'Espalda'], ['Peso muerto', 'Espalda'],
  ['Dominadas asistidas', 'Espalda'], ['Sentadilla', 'Piernas'], ['Prensa de piernas', 'Piernas'],
  ['Extensión de cuádriceps', 'Piernas'], ['Curl femoral', 'Piernas'], ['Peso muerto rumano', 'Piernas'],
  ['Zancadas', 'Piernas'], ['Elevación de gemelos', 'Piernas'], ['Hip thrust', 'Glúteos'],
  ['Press militar', 'Hombros'], ['Elevaciones laterales', 'Hombros'], ['Pájaros', 'Hombros'],
  ['Face pull', 'Hombros'], ['Curl de bíceps', 'Bíceps'], ['Curl martillo', 'Bíceps'],
  ['Curl en polea', 'Bíceps'], ['Extensión de tríceps', 'Tríceps'], ['Press francés', 'Tríceps'],
  ['Extensión sobre la cabeza', 'Tríceps'], ['Plancha', 'Core'], ['Crunch en polea', 'Core'],
  ['Elevación de piernas', 'Core'], ['Ab wheel', 'Core'], ['Press Pallof', 'Core'],
];

function slug(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const SEED_EXERCISES: Exercise[] = entries.map(([name, muscleGroup]) => ({
  id: slug(name), name, muscleGroup,
}));

function planned(exerciseId: string, order: number, sets: number, reps: number, weight: number): PlannedExercise {
  return { id: `plan-${exerciseId}`, exerciseId, order, recommendedSets: sets, recommendedReps: reps, recommendedWeight: weight, restSeconds: 90 };
}

export const SEED_ROUTINE: WorkoutPlan = {
  id: 'main',
  name: 'Rutina fuerza e hipertrofia',
  updatedAt: new Date().toISOString(),
  days: [
    { day: 0, title: 'Descanso', exercises: [] },
    { day: 1, title: 'Pecho + tríceps', exercises: [planned('press-banca', 0, 3, 10, 40), planned('press-inclinado-con-mancuernas', 1, 3, 10, 14), planned('aperturas-en-maquina', 2, 3, 12, 25), planned('extension-de-triceps', 3, 3, 12, 20)] },
    { day: 2, title: 'Espalda + bíceps', exercises: [planned('jalon-al-pecho', 0, 3, 10, 40), planned('remo-sentado', 1, 3, 10, 35), planned('face-pull', 2, 3, 12, 15), planned('curl-de-biceps', 3, 3, 12, 10)] },
    { day: 3, title: 'Piernas', exercises: [planned('sentadilla', 0, 3, 10, 35), planned('prensa-de-piernas', 1, 3, 12, 70), planned('curl-femoral', 2, 3, 12, 25), planned('elevacion-de-gemelos', 3, 3, 15, 30)] },
    { day: 4, title: 'Hombros + core', exercises: [planned('press-militar', 0, 3, 10, 20), planned('elevaciones-laterales', 1, 3, 12, 7.5), planned('pajaros', 2, 3, 12, 6), planned('plancha', 3, 3, 45, 0)] },
    { day: 5, title: 'Torso', exercises: [planned('press-banca', 0, 3, 8, 42.5), planned('jalon-al-pecho', 1, 3, 10, 42.5), planned('remo-con-mancuerna', 2, 3, 10, 16), planned('curl-martillo', 3, 3, 12, 10)] },
    { day: 6, title: 'Descanso', exercises: [] },
  ],
};
