import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import type { Room } from '../../../shared/types';

@Component({
  selector: 'app-public-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Available Rooms</h1>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {{ error() }}
      </div>

      <!-- Rooms Grid -->
      <div *ngIf="!loading() && !error()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let room of rooms()"
             class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <img [src]="room.imageUrl || '/assets/default-room.jpg'"
               [alt]="'Room ' + room.roomNumber"
               class="w-full h-48 object-cover">

          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-xl font-semibold text-gray-800">Room {{ room.roomNumber }}</h2>
              <span [class]="'px-2 py-1 text-xs font-semibold rounded ' +
                            (room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
                {{ room.available ? 'Available' : 'Occupied' }}
              </span>
            </div>

            <p class="text-gray-600 mb-2">{{ room.type }}</p>
            <p class="text-gray-700 text-sm mb-3">{{ room.description }}</p>

            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-blue-600">\${{ room.price }}/night</span>
              <button [routerLink]="['/room', room.id]"
                      [disabled]="!room.available"
                      [class]="'px-4 py-2 rounded transition-colors duration-200 ' +
                              (room.available
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed')">
                {{ room.available ? 'View Details' : 'Not Available' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && rooms().length === 0"
           class="text-center py-12">
        <p class="text-gray-500 text-lg">No rooms available at the moment.</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PublicRoomsComponent implements OnInit {
  private publicService = inject(PublicService);

  rooms = signal<Room[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.loading.set(true);
    this.error.set(null);

    this.publicService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.error.set('Failed to load rooms. Please try again later.');
        this.loading.set(false);
      }
    });
  }
}