import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { AuthService } from '../../../core/services/auth.service';
import type { Room } from '../../../shared/types';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Back Button -->
      <button (click)="goBack()"
              class="mb-4 flex items-center text-blue-600 hover:text-blue-800">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Rooms
      </button>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {{ error() }}
      </div>

      <!-- Room Details -->
      <div *ngIf="room() && !loading()" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Room Image -->
          <div class="h-96 lg:h-auto">
            <img [src]="room()!.imageUrl || '/assets/default-room.jpg'"
                 [alt]="'Room ' + room()!.roomNumber"
                 class="w-full h-full object-cover">
          </div>

          <!-- Room Information -->
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h1 class="text-3xl font-bold text-gray-800">Room {{ room()!.roomNumber }}</h1>
              <span [class]="'px-3 py-1 text-sm font-semibold rounded ' +
                            (room()!.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
                {{ room()!.available ? 'Available' : 'Occupied' }}
              </span>
            </div>

            <p class="text-xl text-gray-600 mb-4">{{ room()!.type }}</p>
            <p class="text-gray-700 mb-6">{{ room()!.description }}</p>

            <div class="border-t pt-4 mb-6">
              <p class="text-3xl font-bold text-blue-600 mb-2">${{ room()!.price }}/night</p>
            </div>

            <!-- Reserved Dates Section -->
            <div class="border-t pt-4 mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Reserved Dates</h3>

              <div *ngIf="loadingDates()" class="text-gray-500">
                Loading reserved dates...
              </div>

              <div *ngIf="!loadingDates() && reservedDates().length === 0" class="text-green-600">
                No reservations - All dates are available!
              </div>

              <div *ngIf="!loadingDates() && reservedDates().length > 0" class="space-y-2">
                <p class="text-sm text-gray-600 mb-2">This room is reserved on the following dates:</p>
                <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  <span *ngFor="let date of reservedDates()"
                        class="px-2 py-1 bg-red-50 text-red-700 text-sm rounded">
                    {{ formatDate(date) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button *ngIf="room()!.available && isAuthenticated()"
                      (click)="bookRoom()"
                      class="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                Book Now
              </button>

              <button *ngIf="room()!.available && !isAuthenticated()"
                      (click)="navigateToLogin()"
                      class="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200">
                Login to Book
              </button>

              <button *ngIf="!room()!.available"
                      disabled
                      class="flex-1 bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed">
                Not Available
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RoomDetailComponent implements OnInit {
  private publicService = inject(PublicService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  room = signal<Room | null>(null);
  reservedDates = signal<string[]>([]);
  loading = signal(false);
  loadingDates = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.loadRoomDetails(+roomId);
      this.loadReservedDates(+roomId);
    } else {
      this.error.set('Invalid room ID');
    }
  }

  loadRoomDetails(roomId: number) {
    this.loading.set(true);
    this.error.set(null);

    this.publicService.getRoomDetails(roomId).subscribe({
      next: (room) => {
        this.room.set(room);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load room details:', err);
        // If the endpoint doesn't exist yet, we can still try to load from getAllRooms
        this.loadRoomFromList(roomId);
      }
    });
  }

  // Fallback method if getRoomDetails endpoint doesn't exist
  loadRoomFromList(roomId: number) {
    this.publicService.getAllRooms().subscribe({
      next: (rooms) => {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          this.room.set(room);
        } else {
          this.error.set('Room not found');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.error.set('Failed to load room details. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  loadReservedDates(roomId: number) {
    this.loadingDates.set(true);

    this.publicService.getReservedDates(roomId).subscribe({
      next: (dates) => {
        this.reservedDates.set(dates);
        this.loadingDates.set(false);
      },
      error: (err) => {
        console.error('Failed to load reserved dates:', err);
        // Don't show error for reserved dates, just set empty array
        this.reservedDates.set([]);
        this.loadingDates.set(false);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  bookRoom() {
    if (this.room()) {
      this.router.navigate(['/client/book-room', this.room()!.id]);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: `/room/${this.room()?.id}` }
    });
  }

  goBack() {
    this.router.navigate(['/rooms']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}