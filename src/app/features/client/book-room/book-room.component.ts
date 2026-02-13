import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { PublicService } from '../../../core/services/public.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import type { Room, ClientAddBookingRequest } from '../../../shared/types';

@Component({
  selector: 'app-book-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Book Room</h1>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Booking Form -->
      <div *ngIf="room() && !loading()" class="bg-white rounded-lg shadow-lg p-6">
        <!-- Room Summary -->
        <div class="mb-6 pb-6 border-b">
          <h2 class="text-xl font-semibold mb-2">Room {{ room()!.roomNumber }}</h2>
          <p class="text-gray-600">{{ room()!.type }}</p>
          <p class="text-2xl font-bold text-blue-600 mt-2">\${{ room()!.price }}/night</p>
        </div>

        <!-- Date Selection -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Select Dates</h3>

          <!-- Show reserved dates warning -->
          <div *ngIf="reservedDates().length > 0" class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
            <p class="font-semibold mb-2">Note: Some dates are unavailable</p>
            <div class="text-sm">
              The following periods are already reserved:
              <div class="mt-2 flex flex-wrap gap-2">
                <span *ngFor="let period of reservedDates()"
                      class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  {{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
              <input type="date"
                     [(ngModel)]="startDate"
                     [min]="minDate"
                     (change)="onDateChange()"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
              <input type="date"
                     [(ngModel)]="endDate"
                     [min]="minEndDate"
                     (change)="onDateChange()"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <!-- Date validation message -->
          <div *ngIf="dateValidationError()" class="mt-2 text-red-600 text-sm">
            {{ dateValidationError() }}
          </div>

          <!-- Date conflict warning -->
          <div *ngIf="hasDateConflict()" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Conflict!</strong> The selected dates overlap with existing reservations. Please choose different dates.
          </div>
        </div>

        <!-- Booking Summary -->
        <div *ngIf="startDate && endDate && !dateValidationError()" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Booking Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Check-in:</span>
              <span class="font-medium">{{ formatDate(startDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Check-out:</span>
              <span class="font-medium">{{ formatDate(endDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Number of nights:</span>
              <span class="font-medium">{{ calculateNights() }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t text-lg font-semibold">
              <span>Total Price:</span>
              <span class="text-blue-600">\${{ calculateTotalPrice() }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button (click)="cancelBooking()"
                  class="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200">
            Cancel
          </button>

          <button (click)="confirmBooking()"
                  [disabled]="!canBook() || submitting()"
                  [class]="'flex-1 px-6 py-3 rounded-lg transition-colors duration-200 ' +
                          (canBook() && !submitting()
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed')">
            <span *ngIf="!submitting()">Confirm Booking</span>
            <span *ngIf="submitting()">Processing...</span>
          </button>
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
export class BookRoomComponent implements OnInit {
  private clientService = inject(ClientService);
  private publicService = inject(PublicService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  room = signal<Room | null>(null);
  reservedDates = signal<Array<{ startDate: string; endDate: string }>>([]);
  loading = signal(false);
  submitting = signal(false);
  dateValidationError = signal<string | null>(null);

  startDate: string = '';
  endDate: string = '';
  minDate: string = '';
  minEndDate: string = '';

  ngOnInit() {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.minEndDate = today.toISOString().split('T')[0];

    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.loadRoomAndReservedDates(+roomId);
    } else {
      this.toastService.error('Identifiant de chambre invalide');
    }
  }

  loadRoomAndReservedDates(roomId: number) {
    this.loading.set(true);

    // Load room details and reserved dates in parallel
    Promise.all([
      this.loadRoom(roomId),
      this.loadReservedDates(roomId)
    ]).then(() => {
      this.loading.set(false);
    }).catch((err) => {
      console.error('Error loading data:', err);
      this.toastService.error('Impossible de charger les informations de la chambre');
      this.loading.set(false);
    });
  }

  async loadRoom(roomId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.publicService.getAllRooms().subscribe({
        next: (rooms) => {
          const room = rooms.find(r => r.id === roomId);
          if (room) {
            this.room.set(room);
            resolve();
          } else {
            reject('Room not found');
          }
        },
        error: reject
      });
    });
  }

  async loadReservedDates(roomId: number): Promise<void> {
    return new Promise((resolve) => {
      this.publicService.getReservedDates(roomId).subscribe({
        next: (dates) => {
          this.reservedDates.set(dates);
          resolve();
        },
        error: (err) => {
          console.error('Failed to load reserved dates:', err);
          this.reservedDates.set([]);
          resolve(); // Don't fail the whole operation
        }
      });
    });
  }

  onDateChange() {
    this.dateValidationError.set(null);

    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      if (end <= start) {
        this.dateValidationError.set('Check-out date must be after check-in date');
        return;
      }

      // Update minimum end date
      const minEnd = new Date(this.startDate);
      minEnd.setDate(minEnd.getDate() + 1);
      this.minEndDate = minEnd.toISOString().split('T')[0];
    }
  }

  hasDateConflict(): boolean {
    if (!this.startDate || !this.endDate || this.reservedDates().length === 0) {
      return false;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    return this.reservedDates().some(period => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      
      return (start >= periodStart && start <= periodEnd) ||
             (end >= periodStart && end <= periodEnd) ||
             (start <= periodStart && end >= periodEnd);
    });
  }

  canBook(): boolean {
    return !!(this.startDate && this.endDate &&
              !this.dateValidationError() &&
              !this.hasDateConflict() &&
              this.room());
  }

  calculateNights(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateTotalPrice(): number {
    if (!this.room()) return 0;
    return this.calculateNights() * this.room()!.price;
  }

  async confirmBooking() {
    if (!this.canBook()) return;

    this.submitting.set(true);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('Vous devez être connecté pour effectuer une réservation');
      this.submitting.set(false);
      return;
    }

    const bookingRequest: ClientAddBookingRequest = {
      userId: currentUser.id,
      roomId: this.room()!.id,
      startDate: this.startDate,
      endDate: this.endDate,
      totalPrice: this.calculateTotalPrice()
    };

    try {
      // Use the enhanced booking method with validation
      const booking = await this.clientService.addBookingWithValidation(bookingRequest);
      console.log('Booking created successfully:', booking);

      // Navigate to bookings page with success message
      this.router.navigate(['/client/bookings'], {
        queryParams: { success: 'Booking created successfully!' }
      });
    } catch (error: any) {
      console.error('Booking failed:', error);
      this.toastService.error(error.message || 'Erreur lors de la creation de la reservation');
      this.submitting.set(false);

      // Reload reserved dates in case they changed
      if (this.room()) {
        this.loadReservedDates(this.room()!.id);
      }
    }
  }

  cancelBooking() {
    this.router.navigate(['/client/dashboard']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}