import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GymStore } from '../../core/data/gym-store';
import { formatLongDate } from '../../core/domain/date.utils';
import { calculateVolume } from '../../core/domain/progress';

@Component({ selector: 'app-history', imports: [RouterLink], templateUrl: './history.component.html', styleUrl: './history.component.scss' })
export class HistoryComponent {
  protected readonly store = inject(GymStore);
  protected date(value: string): string { return formatLongDate(value); }
  protected volume(index: number): number { return this.store.sessions()[index].exercises.reduce((sum, item) => sum + calculateVolume(item.sets), 0); }
}
