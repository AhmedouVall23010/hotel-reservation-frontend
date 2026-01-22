import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import type { Booking, Room } from '../../../shared/types';
import { BookingStatus } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.html',
  styleUrl: './dashboard-overview.css',
})
export class DashboardOverviewComponent implements OnInit {
  private clientService = inject(ClientService);

  availableRooms = signal<Room[]>([]);
  myBookings = signal<Booking[]>([]);
  pendingBookings = signal<Booking[]>([]);
  confirmedBookings = signal<Booking[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    this.clientService.getAllRooms().subscribe({
      next: (rooms) => {
        this.availableRooms.set(rooms.filter(r => r.available));
        this.loadBookings();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadBookings(): void {
    this.clientService.getAllBookings().subscribe({
      next: (bookings) => {
        this.myBookings.set(bookings);
        this.pendingBookings.set(bookings.filter(b => b.status === BookingStatus.PENDING));
        this.confirmedBookings.set(bookings.filter(b => b.status === BookingStatus.CONFIRMED));
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

  getTotalMyBookings(): number {
    return this.myBookings().length;
  }

  getTotalPendingBookings(): number {
    return this.pendingBookings().length;
  }

  getTotalConfirmedBookings(): number {
    return this.confirmedBookings().length;
  }
}
