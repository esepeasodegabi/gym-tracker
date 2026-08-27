import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { Exercise, WorkoutPlan, WorkoutSession } from '../domain/models';

interface GymDatabase extends DBSchema {
  exercises: { key: string; value: Exercise };
  routines: { key: string; value: WorkoutPlan };
  sessions: { key: string; value: WorkoutSession; indexes: { 'by-date': string } };
  metadata: { key: string; value: { key: string; value: string } };
}

let databasePromise: Promise<IDBPDatabase<GymDatabase>> | undefined;

export function gymDatabase(): Promise<IDBPDatabase<GymDatabase>> {
  databasePromise ??= openDB<GymDatabase>('gym-tracker-db', 1, {
    upgrade(database) {
      database.createObjectStore('exercises', { keyPath: 'id' });
      database.createObjectStore('routines', { keyPath: 'id' });
      const sessions = database.createObjectStore('sessions', { keyPath: 'id' });
      sessions.createIndex('by-date', 'date');
      database.createObjectStore('metadata', { keyPath: 'key' });
    },
  });
  return databasePromise;
}

export type GymDb = IDBPDatabase<GymDatabase>;
