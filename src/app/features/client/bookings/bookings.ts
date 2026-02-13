import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { ToastService } from '../../../core/services/toast.service';
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
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  bookings = signal<Booking[]>([]);
  loading = signal(false);
  selectedStatus = signal<string>('all');
  
  BookingStatus = BookingStatus;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['success']) {
        this.toastService.success('Reservation creee avec succes');
      }
    });
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
        this.toastService.error('Impossible de charger vos reservations');
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
        this.toastService.success('Reservation annulee avec succes');
        this.loadBookings();
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error("Erreur lors de l'annulation de la reservation");
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
      [BookingStatus.PENDING]: 'bg-warning/10 text-warning',
      [BookingStatus.CONFIRMED]: 'bg-success/10 text-success',
      [BookingStatus.CANCELLED]: 'bg-error/10 text-error',
    };
    return classes[status] || 'bg-sand/20 text-stone';
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
