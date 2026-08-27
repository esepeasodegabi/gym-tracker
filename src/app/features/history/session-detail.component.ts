import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GymStore } from '../../core/data/gym-store';
import { formatLongDate } from '../../core/domain/date.utils';
import { calculateMaxWeight, calculateVolume } from '../../core/domain/progress';

@Component({ selector: 'app-session-detail', imports: [RouterLink], templateUrl: './session-detail.component.html', styleUrl: './session-detail.component.scss' })
export class SessionDetailComponent {
  protected readonly store = inject(GymStore);
  private readonly route = inject(ActivatedRoute);
  protected readonly session = this.store.sessions().find((item) => item.id === this.route.snapshot.paramMap.get('id'));
  protected readonly records = Number(this.route.snapshot.queryParamMap.get('records') ?? 0);
  protected date(value: string): string { return formatLongDate(value); }
  protected volume = calculateVolume;
  protected maxWeight = calculateMaxWeight;
}
