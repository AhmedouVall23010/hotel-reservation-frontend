import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceptionService } from '../../../core/services/reception.service';
import { BookingStatus } from '../../../core/constants/api.constants';
import type { Booking } from '../../../shared/types';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class BookingsComponent implements OnInit {
  private receptionService = inject(ReceptionService);

  bookings = signal<Booking[]>([]);
  loading = signal(false);
  selectedStatus = signal<BookingStatus>(BookingStatus.PENDING);
  
  BookingStatus = BookingStatus;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.receptionService.getBookingsByStatus(this.selectedStatus()).subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onStatusChange(status: BookingStatus): void {
    this.selectedStatus.set(status);
    this.loadBookings();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      [BookingStatus.PENDING]: 'En attente',
      [BookingStatus.CONFIRMED]: 'Confirmée',
      [BookingStatus.CANCELLED]: 'Annulée',
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [BookingStatus.CONFIRMED]: 'bg-green-100 text-green-800',
      [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
