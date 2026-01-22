import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { BookingStatus } from '../../../core/constants/api.constants';
import type { Booking, ClientChangeBookingStatusRequest } from '../../../shared/types';

@Component({
  selector: 'app-client-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class BookingsComponent implements OnInit {
  private clientService = inject(ClientService);

  bookings = signal<Booking[]>([]);
  loading = signal(false);
  selectedStatus = signal<string>('all');
  
  BookingStatus = BookingStatus;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.clientService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
  }

  getFilteredBookings(): Booking[] {
    if (this.selectedStatus() === 'all') {
      return this.bookings();
    }
    return this.bookings().filter(b => b.status === this.selectedStatus());
  }

  cancelBooking(booking: Booking): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    this.loading.set(true);
    const request: ClientChangeBookingStatusRequest = {
      status: BookingStatus.CANCELLED,
    };

    this.clientService.changeBookingStatus(booking.id, request).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: () => {
        this.loading.set(false);
      },
    });
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
