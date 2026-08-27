import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GymStore } from '../../core/data/gym-store';
import { currentDayId, DAY_NAMES, formatShortDate } from '../../core/domain/date.utils';
import { findLastPerformance } from '../../core/domain/progress';

@Component({
  selector: 'app-today',
  imports: [RouterLink],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss',
})
export class TodayComponent {
  protected readonly store = inject(GymStore);
  protected readonly dayId = currentDayId();
  protected readonly dayName = DAY_NAMES[this.dayId];
  protected readonly plan = computed(() => this.store.routine()?.days.find((item) => item.day === this.dayId));

  protected last(exerciseId: string) {
    return findLastPerformance(this.store.sessions(), exerciseId);
  }

  protected shortDate(value: string): string { return formatShortDate(value); }
}
