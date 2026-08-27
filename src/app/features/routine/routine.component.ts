import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GymStore } from '../../core/data/gym-store';
import { DAY_NAMES } from '../../core/domain/date.utils';
import { BackupData, DayId, Exercise, PlannedExercise, WorkoutPlan } from '../../core/domain/models';

@Component({ selector: 'app-routine', imports: [FormsModule], templateUrl: './routine.component.html', styleUrl: './routine.component.scss' })
export class RoutineComponent {
  protected readonly store = inject(GymStore);
  protected readonly dayNames = DAY_NAMES;
  protected readonly selectedDay = signal<DayId | null>(null);
  protected readonly search = signal('');
  protected readonly customName = signal('');
  protected readonly customGroup = signal('Otro');
  protected readonly message = signal('');
  protected readonly filteredExercises = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('es');
    return this.store.exercises().filter((item) => !term || `${item.name} ${item.muscleGroup}`.toLocaleLowerCase('es').includes(term)).slice(0, 20);
  });

  protected select(day: DayId): void { this.selectedDay.set(this.selectedDay() === day ? null : day); this.message.set(''); }

  protected async updateDayTitle(day: DayId, title: string): Promise<void> {
    await this.changeRoutine((routine) => { routine.days.find((item) => item.day === day)!.title = title; });
  }

  protected async updatePlanned(day: DayId, id: string, key: keyof Pick<PlannedExercise, 'recommendedSets' | 'recommendedReps' | 'recommendedWeight' | 'restSeconds'>, value: number | string): Promise<void> {
    await this.changeRoutine((routine) => {
      const item = routine.days.find((entry) => entry.day === day)!.exercises.find((entry) => entry.id === id)!;
      item[key] = Math.max(0, Number(value) || 0);
    });
  }

  protected async move(day: DayId, index: number, direction: -1 | 1): Promise<void> {
    await this.changeRoutine((routine) => {
      const list = routine.days.find((item) => item.day === day)!.exercises;
      const target = index + direction;
      if (target < 0 || target >= list.length) return;
      [list[index], list[target]] = [list[target], list[index]];
      list.forEach((item, order) => item.order = order);
    });
  }

  protected async remove(day: DayId, id: string): Promise<void> {
    await this.changeRoutine((routine) => {
      const workoutDay = routine.days.find((item) => item.day === day)!;
      workoutDay.exercises = workoutDay.exercises.filter((item) => item.id !== id).map((item, order) => ({ ...item, order }));
    });
  }

  protected async addExercise(day: DayId, exerciseId: string): Promise<void> {
    await this.changeRoutine((routine) => {
      const workoutDay = routine.days.find((item) => item.day === day)!;
      workoutDay.exercises.push({ id: crypto.randomUUID(), exerciseId, order: workoutDay.exercises.length, recommendedSets: 3, recommendedReps: 10, recommendedWeight: 10, restSeconds: 90 });
      if (workoutDay.title === 'Descanso') workoutDay.title = 'Entrenamiento';
    });
    this.search.set('');
  }

  protected async createCustom(day: DayId): Promise<void> {
    const name = this.customName().trim();
    if (!name) return;
    const exercise: Exercise = { id: crypto.randomUUID(), name, muscleGroup: this.customGroup().trim() || 'Otro' };
    await this.store.saveExercise(exercise);
    await this.addExercise(day, exercise.id);
    this.customName.set('');
  }

  protected exportData(): void {
    const blob = new Blob([JSON.stringify(this.store.exportData(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `mi-rutina-${new Date().toISOString().slice(0, 10)}.json`; link.click();
    URL.revokeObjectURL(link.href); this.message.set('Copia exportada correctamente.');
  }

  protected async importData(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try { await this.store.importData(JSON.parse(await file.text()) as BackupData); this.message.set('Copia restaurada correctamente.'); }
    catch (error) { this.message.set(error instanceof Error ? error.message : 'No se pudo importar la copia.'); }
    input.value = '';
  }

  private async changeRoutine(change: (routine: WorkoutPlan) => void): Promise<void> {
    const routine = structuredClone(this.store.routine()!); change(routine); await this.store.saveRoutine(routine);
  }
}
