import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import type { User, Room } from '../../../shared/types';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.html',
  styleUrl: './dashboard-overview.css',
})
export class DashboardOverviewComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<User[]>([]);
  rooms = signal<Room[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadRooms();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadRooms(): void {
    this.adminService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getTotalUsers(): number {
    return this.users().length;
  }

  getTotalRooms(): number {
    return this.rooms().length;
  }

  getAvailableRooms(): number {
    return this.rooms().filter(room => room.available).length;
  }

  getOccupiedRooms(): number {
    return this.rooms().filter(room => !room.available).length;
  }
}
