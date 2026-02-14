import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceptionService } from '../../../core/services/reception.service';
import { ToastService } from '../../../core/services/toast.service';
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
  private toastService = inject(ToastService);

  bookings = signal<Booking[]>([]);
  filteredBookings = signal<Booking[]>([]);
  loading = signal(false);
  selectedStatus = signal<BookingStatus>(BookingStatus.PENDING);
  
  BookingStatus = BookingStatus;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.receptionService.getActiveBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.filterBookings();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les reservations');
      },
    });
  }

  onStatusChange(status: BookingStatus): void {
    this.selectedStatus.set(status);
    this.filterBookings();
  }

  filterBookings(): void {
    const status = this.selectedStatus();
    const allBookings = this.bookings();
    const filtered = allBookings.filter(booking => booking.status === status);
    this.filteredBookings.set(filtered);
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

  changeStatus(booking: Booking, newStatus: BookingStatus): void {
    if (booking.status === newStatus) {
      return;
    }

    this.loading.set(true);
    this.receptionService.changeBookingStatus(booking.id, { status: newStatus }).subscribe({
      next: (response) => {
        this.bookings.update(bookings => 
          bookings.map(b => b.id === booking.id ? response.booking : b)
        );
        this.filterBookings();
        this.loading.set(false);
        this.toastService.success('Statut modifie avec succes');
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Erreur lors de la modification du statut');
      },
    });
  }

  getAvailableStatuses(currentStatus: string): BookingStatus[] {
    const allStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED];
    return allStatuses.filter(status => status !== currentStatus);
  }
}
