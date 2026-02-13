import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import type { AdminBookingAnalysis } from '../../../shared/types';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.html',
  styleUrl: './dashboard-overview.css',
})
export class DashboardOverviewComponent implements OnInit {
  private adminService = inject(AdminService);

  analysis = signal<AdminBookingAnalysis | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loadAnalysis();
  }

  loadAnalysis(): void {
    this.loading.set(true);
    this.adminService.getBookingAnalysis().subscribe({
      next: (analysis) => {
        this.analysis.set(analysis);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getTotalUsers(): number {
    return this.analysis()?.totalUsers || 0;
  }

  getTotalRooms(): number {
    return this.analysis()?.totalRooms || 0;
  }

  getReservedRooms(): number {
    return this.analysis()?.reservedRooms || 0;
  }

  getTotalBookings(): number {
    return this.analysis()?.totalBookings || 0;
  }

  getAvailableRooms(): number {
    const total = this.getTotalRooms();
    const reserved = this.getReservedRooms();
    return Math.max(0, total - reserved);
  }
}
