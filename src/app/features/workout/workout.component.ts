import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GymStore } from '../../core/data/gym-store';
import { DAY_NAMES, toLocalDateKey } from '../../core/domain/date.utils';
import { DayId, ExercisePerformance, PlannedExercise, SetPerformance, WorkoutSession } from '../../core/domain/models';
import { findLastPerformance, isNewRecord, proposeSets } from '../../core/domain/progress';

interface ExerciseDraft {
  planned: PlannedExercise;
  performance: ExercisePerformance;
  last?: ReturnType<typeof findLastPerformance>;
}

@Component({
  selector: 'app-workout',
  imports: [FormsModule, RouterLink],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.scss',
})
export class WorkoutComponent {
  protected readonly store = inject(GymStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly dayId = Number(this.route.snapshot.paramMap.get('day')) as DayId;
  protected readonly dayName = DAY_NAMES[this.dayId];
  protected readonly plan = this.store.routine()!.days.find((day) => day.day === this.dayId)!;
  private readonly startedAt = new Date();
  protected readonly saving = signal(false);
  protected readonly drafts = signal<ExerciseDraft[]>(
    this.plan.exercises.map((planned) => {
      const last = findLastPerformance(this.store.sessions(), planned.exerciseId);
      return {
        planned,
        last,
        performance: {
          exerciseId: planned.exerciseId,
          plannedExerciseId: planned.id,
          sets: proposeSets(last?.performance, planned.recommendedSets, planned.recommendedReps, planned.recommendedWeight),
        },
      };
    }),
  );
  protected readonly completedCount = computed(() => this.drafts().flatMap((item) => item.performance.sets).filter((set) => set.completed).length);
  protected readonly totalSets = computed(() => this.drafts().flatMap((item) => item.performance.sets).length);

  protected adjust(draftIndex: number, setIndex: number, key: 'weight' | 'reps', amount: number): void {
    const set = this.drafts()[draftIndex].performance.sets[setIndex];
    set[key] = Math.max(0, Math.round((set[key] + amount) * 10) / 10);
    this.refresh();
  }

  protected setValue(draftIndex: number, setIndex: number, key: 'weight' | 'reps', value: number | string): void {
    const parsed = Number(value);
    this.drafts()[draftIndex].performance.sets[setIndex][key] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    this.refresh();
  }

  protected toggleSet(draftIndex: number, setIndex: number): void {
    const set = this.drafts()[draftIndex].performance.sets[setIndex];
    set.completed = !set.completed;
    this.refresh();
  }

  protected addSet(draftIndex: number): void {
    const sets = this.drafts()[draftIndex].performance.sets;
    const source = sets.at(-1) ?? { weight: 0, reps: 10, completed: false };
    sets.push({ ...source, completed: false });
    this.refresh();
  }

  protected removeSet(draftIndex: number, setIndex: number): void {
    const sets = this.drafts()[draftIndex].performance.sets;
    if (sets.length > 1) sets.splice(setIndex, 1);
    this.refresh();
  }

  protected completeExercise(draftIndex: number): void {
    for (const set of this.drafts()[draftIndex].performance.sets) set.completed = true;
    this.refresh();
  }

  protected async finish(): Promise<void> {
    if (!this.completedCount() || this.saving()) return;
    this.saving.set(true);
    const now = new Date();
    const performances = this.drafts()
      .map((draft) => ({ ...draft.performance, sets: draft.performance.sets.filter((set) => set.completed) }))
      .filter((performance) => performance.sets.length);
    const records = performances.filter((performance) => isNewRecord(performance, this.store.sessions())).length;
    const session: WorkoutSession = {
      id: crypto.randomUUID(), date: toLocalDateKey(now), day: this.dayId, title: this.plan.title,
      startedAt: this.startedAt.toISOString(), completedAt: now.toISOString(),
      durationMinutes: Math.max(1, Math.round((now.getTime() - this.startedAt.getTime()) / 60000)), exercises: performances,
    };
    await this.store.saveSession(session);
    await this.router.navigate(['/historial/sesion', session.id], { queryParams: records ? { records } : undefined });
  }

  private refresh(): void { this.drafts.set([...this.drafts()]); }

  protected seriesText(sets: SetPerformance[]): string {
    return sets.map((set) => `${set.weight} kg × ${set.reps}`).join(' · ');
  }
}
