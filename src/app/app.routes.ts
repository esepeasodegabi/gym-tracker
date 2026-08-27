import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'hoy' },
  { path: 'hoy', loadComponent: () => import('./features/today/today.component').then((m) => m.TodayComponent) },
  { path: 'entrenamiento/:day', loadComponent: () => import('./features/workout/workout.component').then((m) => m.WorkoutComponent) },
  { path: 'historial', loadComponent: () => import('./features/history/history.component').then((m) => m.HistoryComponent) },
  { path: 'historial/sesion/:id', loadComponent: () => import('./features/history/session-detail.component').then((m) => m.SessionDetailComponent) },
  { path: 'ejercicio/:id', loadComponent: () => import('./features/history/exercise-history.component').then((m) => m.ExerciseHistoryComponent) },
  { path: 'rutina', loadComponent: () => import('./features/routine/routine.component').then((m) => m.RoutineComponent) },
  { path: 'estadisticas', loadComponent: () => import('./features/stats/stats.component').then((m) => m.StatsComponent) },
  { path: '**', redirectTo: 'hoy' },
];
