import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { environment } from '../../../../environments/environment';
import type { Room, ClientAddBookingRequest } from '../../../shared/types';

@Component({
  selector: 'app-client-rooms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class RoomsComponent implements OnInit {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  rooms = signal<Room[]>([]);
  loading = signal(false);
  showBookingModal = signal(false);
  selectedRoom = signal<Room | null>(null);
  actionStatus = signal<'idle' | 'success' | 'error'>('idle');

  bookingForm: FormGroup;

  constructor() {
    this.bookingForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.clientService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms.filter(r => r.available));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openBookingModal(room: Room): void {
    this.selectedRoom.set(room);
    this.bookingForm.reset();
    this.showBookingModal.set(true);
    this.actionStatus.set('idle');
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
    this.selectedRoom.set(null);
    this.bookingForm.reset();
  }

  bookRoom(): void {
    if (this.bookingForm.invalid || !this.selectedRoom()) {
      this.markFormGroupTouched(this.bookingForm);
      return;
    }

    this.loading.set(true);
    const bookingData: ClientAddBookingRequest = {
      roomId: this.selectedRoom()!.id,
      startDate: this.bookingForm.value.startDate,
      endDate: this.bookingForm.value.endDate,
    };

    this.clientService.addBooking(bookingData).subscribe({
      next: () => {
        this.actionStatus.set('success');
        setTimeout(() => {
          this.closeBookingModal();
        }, 1000);
      },
      error: () => {
        this.actionStatus.set('error');
        this.loading.set(false);
      },
    });
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${environment.apiUrl}${imageUrl}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
