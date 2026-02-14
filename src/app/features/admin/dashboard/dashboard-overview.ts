import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import type { AdminBookingAnalysis, Booking } from '../../../shared/types';

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
  todayBookings = signal<Booking[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadAnalysis();
    this.loadTodayBookings();
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

  loadTodayBookings(): void {
    this.adminService.getTodayBookings().subscribe({
      next: (bookings) => {
        this.todayBookings.set(bookings);
      },
      error: () => {
        this.todayBookings.set([]);
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

  getTodayBookingsCount(): number {
    return this.todayBookings().length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-warning/10 text-warning',
      CONFIRMED: 'bg-success/10 text-success',
      CANCELLED: 'bg-error/10 text-error',
    };
    return classes[status] || 'bg-sand/20 text-stone';
  }
}
