import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { GymStore } from '../../core/data/gym-store';
import { toLocalDateKey } from '../../core/domain/date.utils';
import { calculateVolume, exerciseSnapshots } from '../../core/domain/progress';

@Component({ selector: 'app-stats', imports: [FormsModule], templateUrl: './stats.component.html', styleUrl: './stats.component.scss' })
export class StatsComponent implements AfterViewInit, OnDestroy {
  protected readonly store = inject(GymStore);
  @ViewChild('weightChart') private weightCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') private volumeCanvas?: ElementRef<HTMLCanvasElement>;
  private weightChart?: Chart;
  private volumeChart?: Chart;
  private viewReady = false;

  protected readonly performedExercises = computed(() => {
    const ids = new Set(this.store.sessions().flatMap((session) => session.exercises.map((item) => item.exerciseId)));
    return this.store.exercises().filter((item) => ids.has(item.id));
  });
  protected readonly selectedId = signal(this.performedExercises()[0]?.id ?? this.store.exercises()[0]?.id ?? '');
  protected readonly totals = computed(() => {
    const now = new Date();
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessions = this.store.sessions();
    return {
      week: sessions.filter((item) => item.date >= toLocalDateKey(monday)).length,
      month: sessions.filter((item) => item.date >= toLocalDateKey(monthStart)).length,
      all: sessions.length,
      volume: sessions.reduce((total, session) => total + session.exercises.reduce((sum, item) => sum + calculateVolume(item.sets), 0), 0),
      exercises: new Set(sessions.flatMap((session) => session.exercises.map((item) => item.exerciseId))).size,
    };
  });

  constructor() {
    effect(() => { this.selectedId(); this.store.sessions(); if (this.viewReady) this.renderCharts(); });
  }

  ngAfterViewInit(): void { this.viewReady = true; this.renderCharts(); }
  ngOnDestroy(): void { this.weightChart?.destroy(); this.volumeChart?.destroy(); }

  protected changeExercise(id: string): void { this.selectedId.set(id); }
  protected compact(value: number): string { return new Intl.NumberFormat('es-ES', { notation: value >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value); }

  private renderCharts(): void {
    if (!this.weightCanvas || !this.volumeCanvas) return;
    const points = exerciseSnapshots(this.store.sessions(), this.selectedId());
    const labels = points.map((item) => new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(`${item.date}T12:00:00`)));
    const common = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { displayColors: false } },
      scales: { x: { grid: { display: false }, ticks: { color: '#93a2b5', maxRotation: 0 } }, y: { beginAtZero: true, grid: { color: 'rgba(147,162,181,.12)' }, ticks: { color: '#93a2b5' } } },
    } as const;
    this.weightChart?.destroy(); this.volumeChart?.destroy();
    this.weightChart = new Chart(this.weightCanvas.nativeElement, { type: 'line', data: { labels, datasets: [{ data: points.map((item) => item.maxWeight), borderColor: '#5ee1a1', backgroundColor: 'rgba(94,225,161,.13)', fill: true, tension: .3, pointRadius: 4, pointBackgroundColor: '#5ee1a1' }] }, options: common });
    this.volumeChart = new Chart(this.volumeCanvas.nativeElement, { type: 'line', data: { labels, datasets: [{ data: points.map((item) => item.volume), borderColor: '#7aa7ff', backgroundColor: 'rgba(122,167,255,.13)', fill: true, tension: .3, pointRadius: 4, pointBackgroundColor: '#7aa7ff' }] }, options: common });
  }
}
