import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { PublicService } from '../../../core/services/public.service';
import { AuthService } from '../../../core/services/auth.service';
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
  private publicService = inject(PublicService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  rooms = signal<Room[]>([]);
  loading = signal(false);
  showBookingModal = signal(false);
  selectedRoom = signal<Room | null>(null);
  actionStatus = signal<'idle' | 'success' | 'error'>('idle');
  totalPrice = signal<number>(0);
  reservedPeriods = signal<Array<{ startDate: string; endDate: string }>>([]);
  calendarDate = signal<Date>(new Date());
  selectedStartDate = signal<Date | null>(null);
  selectedEndDate = signal<Date | null>(null);

  bookingForm: FormGroup;

  constructor() {
    this.bookingForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });

    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.publicService.getAllRooms().subscribe({
      next: (rooms: Room[]) => {
        this.rooms.set(rooms.filter((r: Room) => r.available));
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
    this.totalPrice.set(0);
    this.selectedStartDate.set(null);
    this.selectedEndDate.set(null);
    this.calendarDate.set(new Date());
    this.showBookingModal.set(true);
    this.actionStatus.set('idle');
    this.loadReservedDates(room.id);
  }

  loadReservedDates(roomId: number): void {
    this.publicService.getReservedDates(roomId).subscribe({
      next: (periods) => {
        this.reservedPeriods.set(periods);
      },
      error: () => {
        this.reservedPeriods.set([]);
      },
    });
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
    this.selectedRoom.set(null);
    this.bookingForm.reset();
    this.selectedStartDate.set(null);
    this.selectedEndDate.set(null);
    this.reservedPeriods.set([]);
  }

  calculateTotalPrice(): void {
    const startDate = this.bookingForm.get('startDate')?.value;
    const endDate = this.bookingForm.get('endDate')?.value;
    const room = this.selectedRoom();

    if (!startDate || !endDate || !room) {
      this.totalPrice.set(0);
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      this.totalPrice.set(0);
      return;
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const days = diffDays + 1;
    const total = days * room.price;
    this.totalPrice.set(total);
  }

  bookRoom(): void {
    if (this.bookingForm.invalid || !this.selectedRoom()) {
      this.markFormGroupTouched(this.bookingForm);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.actionStatus.set('error');
      return;
    }

    this.loading.set(true);
    const bookingData: ClientAddBookingRequest = {
      userId: currentUser.id,
      roomId: this.selectedRoom()!.id,
      startDate: this.bookingForm.value.startDate,
      endDate: this.bookingForm.value.endDate,
      totalPrice: this.totalPrice(),
    };

    this.clientService.addBooking(bookingData).subscribe({
      next: () => {
        this.loading.set(false);
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

  getCalendarDays(): Date[] {
    const year = this.calendarDate().getFullYear();
    const month = this.calendarDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }
    
    return days.slice(0, 30);
  }

  getMonthName(): string {
    return this.calendarDate().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    const newDate = new Date(this.calendarDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.calendarDate.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.calendarDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.calendarDate.set(newDate);
  }

  isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return true;
    }

    const periods = this.reservedPeriods();
    for (const period of periods) {
      const start = new Date(period.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(period.endDate);
      end.setHours(0, 0, 0, 0);

      if (checkDate >= start && checkDate <= end) {
        return true;
      }
    }

    const startDate = this.selectedStartDate();
    const endDate = this.selectedEndDate();

    if (startDate && !endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 30);

      for (const period of periods) {
        const periodStart = new Date(period.startDate);
        periodStart.setHours(0, 0, 0, 0);
        const periodEnd = new Date(period.endDate);
        periodEnd.setHours(0, 0, 0, 0);

        if (checkDate > start && checkDate < end) {
          if (checkDate >= periodStart && checkDate <= periodEnd) {
            return true;
          }
        }
      }
    }

    return false;
  }

  isDateSelected(date: Date): boolean {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (start) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      if (checkDate.getTime() === startDate.getTime()) {
        return true;
      }
    }

    if (end) {
      const endDate = new Date(end);
      endDate.setHours(0, 0, 0, 0);
      if (checkDate.getTime() === endDate.getTime()) {
        return true;
      }
    }

    return false;
  }

  isDateInRange(date: Date): boolean {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (start && end) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(0, 0, 0, 0);

      return checkDate > startDate && checkDate < endDate;
    }

    return false;
  }

  selectDate(date: Date): void {
    if (this.isDateDisabled(date)) {
      return;
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (!start || (start && end)) {
      this.selectedStartDate.set(selectedDate);
      this.selectedEndDate.set(null);
      this.bookingForm.patchValue({
        startDate: this.formatDateForInput(selectedDate),
        endDate: '',
      });
    } else {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      if (selectedDate < startDate) {
        this.selectedStartDate.set(selectedDate);
        this.selectedEndDate.set(null);
        this.bookingForm.patchValue({
          startDate: this.formatDateForInput(selectedDate),
          endDate: '',
        });
      } else {
        const periods = this.reservedPeriods();
        let hasConflict = false;

        for (let d = new Date(startDate); d <= selectedDate; d.setDate(d.getDate() + 1)) {
          const checkDate = new Date(d);
          checkDate.setHours(0, 0, 0, 0);

          for (const period of periods) {
            const periodStart = new Date(period.startDate);
            periodStart.setHours(0, 0, 0, 0);
            const periodEnd = new Date(period.endDate);
            periodEnd.setHours(0, 0, 0, 0);

            if (checkDate >= periodStart && checkDate <= periodEnd && checkDate > startDate && checkDate < selectedDate) {
              hasConflict = true;
              break;
            }
          }

          if (hasConflict) break;
        }

        if (!hasConflict) {
          this.selectedEndDate.set(selectedDate);
          this.bookingForm.patchValue({
            endDate: this.formatDateForInput(selectedDate),
          });
        }
      }
    }

    this.calculateTotalPrice();
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
