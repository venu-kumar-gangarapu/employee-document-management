import { Component, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe, KeyValuePipe } from '@angular/common';

import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary, CountMap, RecentDocument } from '../../models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    KeyValuePipe
  ],
  templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  private s = inject(DashboardService);

  summary = signal<DashboardSummary | null>(null);

  departments = signal<CountMap>({});

  recentEmployees = signal<any[]>([]);

  recentDocuments = signal<RecentDocument[]>([]);

  error = signal('');

  constructor() {

    this.s.summary().subscribe({
      next: x => this.summary.set(x),
      error: e => this.error.set(this.s.errorMessage(e))
    });

    this.s.departments().subscribe(x => {
      this.departments.set(x);
    });

    this.s.recentEmployees().subscribe(x => {
      this.recentEmployees.set(x);
    });

    this.s.recentDocuments().subscribe(x => {
      this.recentDocuments.set(x);
    });
  }
}
