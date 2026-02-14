import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceptionService } from '../../../core/services/reception.service';
import type { Room, Booking } from '../../../shared/types';
import { BookingStatus } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.html',
  styleUrl: './dashboard-overview.css',
})
export class DashboardOverviewComponent implements OnInit {
  private receptionService = inject(ReceptionService);

  availableRooms = signal<Room[]>([]);
  reservedRooms = signal<Room[]>([]);
  pendingBookings = signal<Booking[]>([]);
  confirmedBookings = signal<Booking[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    this.receptionService.getRoomsAvailable().subscribe({
      next: (rooms) => {
        this.availableRooms.set(rooms);
        this.loadReservedRooms();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadReservedRooms(): void {
    this.receptionService.getRoomsReserved().subscribe({
      next: (rooms) => {
        this.reservedRooms.set(rooms);
        this.loadBookings();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadBookings(): void {
    this.receptionService.getActiveBookings().subscribe({
      next: (bookings) => {
        const pending = bookings.filter(b => b.status === BookingStatus.PENDING);
        const confirmed = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
        this.pendingBookings.set(pending);
        this.confirmedBookings.set(confirmed);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getTotalAvailableRooms(): number {
    return this.availableRooms().length;
  }

  getTotalReservedRooms(): number {
    return this.reservedRooms().length;
  }

  getTotalPendingBookings(): number {
    return this.pendingBookings().length;
  }

  getTotalConfirmedBookings(): number {
    return this.confirmedBookings().length;
  }
}
