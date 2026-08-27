import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GymStore } from '../../core/data/gym-store';
import { formatShortDate } from '../../core/domain/date.utils';
import { calculateVolume, exerciseSnapshots } from '../../core/domain/progress';

@Component({ selector: 'app-exercise-history', imports: [RouterLink], templateUrl: './exercise-history.component.html', styleUrl: './exercise-history.component.scss' })
export class ExerciseHistoryComponent {
  protected readonly store = inject(GymStore);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  protected readonly exercise = this.store.exerciseMap().get(this.id);
  protected readonly snapshots = exerciseSnapshots(this.store.sessions(), this.id).reverse();
  protected readonly bestWeight = Math.max(0, ...this.snapshots.map((item) => item.maxWeight));
  protected readonly bestVolume = Math.max(0, ...this.snapshots.map((item) => item.volume));
  protected date = formatShortDate;
  protected volume = calculateVolume;
}
