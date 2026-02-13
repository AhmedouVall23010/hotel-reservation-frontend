import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PublicService } from '../../../core/services/public.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingStatus, UserRole } from '../../../core/constants/api.constants';
import type { Booking, AdminAddBookingRequest, AdminUpdateBookingRequest, User, Room } from '../../../shared/types';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class BookingsComponent implements OnInit {
  private adminService = inject(AdminService);
  private publicService = inject(PublicService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  bookings = signal<Booking[]>([]);
  users = signal<User[]>([]);
  clientUsers = signal<User[]>([]);
  rooms = signal<Room[]>([]);
  loading = signal(false);
  showBookingModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  showDeleteModal = signal(false);
  selectedBooking = signal<Booking | null>(null);
  bookingToDelete = signal<Booking | null>(null);
  selectedRoom = signal<Room | null>(null);
  reservedPeriods = signal<Array<{ startDate: string; endDate: string }>>([]);
  calendarDate = signal<Date>(new Date());
  selectedStartDate = signal<Date | null>(null);
  selectedEndDate = signal<Date | null>(null);
  totalPrice = signal<number>(0);

  addForm: FormGroup;
  editForm: FormGroup;

  BookingStatus = BookingStatus;
  statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED];

  constructor() {
    this.addForm = this.fb.group({
      userId: ['', [Validators.required]],
      roomId: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      status: [BookingStatus.PENDING, [Validators.required]],
    });

    this.editForm = this.fb.group({
      status: [BookingStatus.PENDING, [Validators.required]],
      startDate: [''],
      endDate: [''],
    });

    this.addForm.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }

  ngOnInit(): void {
    this.loadBookings();
    this.loadUsers();
    this.loadRooms();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.adminService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les reservations');
      },
    });
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        const clients = users.filter(user => user.role === UserRole.USER);
        this.clientUsers.set(clients);
      },
      error: () => {
        this.toastService.error('Impossible de charger les utilisateurs');
      },
    });
  }

  loadRooms(): void {
    this.adminService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
      },
      error: () => {
        this.toastService.error('Impossible de charger les chambres');
      },
    });
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.selectedBooking.set(null);
    this.addForm.reset();
    this.selectedRoom.set(null);
    this.selectedStartDate.set(null);
    this.selectedEndDate.set(null);
    this.calendarDate.set(new Date());
    this.reservedPeriods.set([]);
    this.totalPrice.set(0);
    this.showBookingModal.set(true);
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
    this.modalMode.set('add');
    this.selectedBooking.set(null);
    this.addForm.reset();
    this.selectedRoom.set(null);
    this.selectedStartDate.set(null);
    this.selectedEndDate.set(null);
    this.reservedPeriods.set([]);
    this.totalPrice.set(0);
  }

  onRoomSelect(): void {
    const roomId = this.addForm.get('roomId')?.value;
    if (roomId) {
      const room = this.rooms().find(r => r.id === Number(roomId));
      this.selectedRoom.set(room || null);
      if (room) {
        this.loadReservedDates(room.id);
      }
    } else {
      this.selectedRoom.set(null);
      this.reservedPeriods.set([]);
    }
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

  calculateTotalPrice(): void {
    const startDate = this.addForm.get('startDate')?.value;
    const endDate = this.addForm.get('endDate')?.value;
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

  openEditModal(booking: Booking): void {
    this.modalMode.set('edit');
    this.selectedBooking.set(booking);
    const room = this.rooms().find(r => r.id === booking.room.id);
    this.selectedRoom.set(room || null);
    
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    this.selectedStartDate.set(startDate);
    this.selectedEndDate.set(endDate);
    this.calendarDate.set(startDate);
    
    this.addForm.patchValue({
      userId: booking.user?.id || '',
      roomId: booking.room.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
    });
    
    if (room) {
      this.loadReservedDatesForEdit(room.id, booking.id);
    }
    
    this.calculateTotalPrice();
    this.showBookingModal.set(true);
  }

  loadReservedDatesForEdit(roomId: number, currentBookingId: number): void {
    this.publicService.getReservedDates(roomId).subscribe({
      next: (periods) => {
        const booking = this.selectedBooking();
        if (!booking) {
          this.reservedPeriods.set(periods);
          return;
        }

        const filteredPeriods = periods.filter(p => {
          const periodStart = new Date(p.startDate);
          const periodEnd = new Date(p.endDate);
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);

          return !(periodStart.getTime() === bookingStart.getTime() && periodEnd.getTime() === bookingEnd.getTime());
        });

        this.reservedPeriods.set(filteredPeriods);
      },
      error: () => {
        this.reservedPeriods.set([]);
      },
    });
  }


  saveBooking(): void {
    if (this.addForm.invalid) {
      this.markFormGroupTouched(this.addForm);
      return;
    }

    const formValue = this.addForm.value;
    if (new Date(formValue.startDate) >= new Date(formValue.endDate)) {
      this.toastService.error('La date de début doit être avant la date de fin');
      return;
    }

    if (this.modalMode() === 'add') {
      this.addBooking();
    } else {
      this.updateBooking();
    }
  }

  addBooking(): void {
    const formValue = this.addForm.value;
    this.loading.set(true);
    const bookingData: AdminAddBookingRequest = {
      userId: Number(formValue.userId),
      roomId: Number(formValue.roomId),
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      status: formValue.status || BookingStatus.PENDING,
    };

    this.adminService.addBooking(bookingData).subscribe({
      next: () => {
        this.toastService.success('Reservation ajoutee avec succes');
        this.loadBookings();
        this.closeBookingModal();
      },
      error: () => {
        this.toastService.error("Erreur lors de l'ajout de la reservation");
        this.loading.set(false);
      },
    });
  }

  updateBooking(): void {
    if (!this.selectedBooking()) {
      return;
    }

    const formValue = this.addForm.value;
    this.loading.set(true);
    const bookingData: AdminUpdateBookingRequest = {
      status: formValue.status,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
    };

    this.adminService.updateBooking(this.selectedBooking()!.id, bookingData).subscribe({
      next: () => {
        this.toastService.success('Reservation modifiee avec succes');
        this.loadBookings();
        this.closeBookingModal();
      },
      error: () => {
        this.toastService.error("Erreur lors de la modification de la reservation");
        this.loading.set(false);
      },
    });
  }

  deleteBooking(booking: Booking): void {
    this.bookingToDelete.set(booking);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.bookingToDelete.set(null);
  }

  confirmDelete(): void {
    const booking = this.bookingToDelete();
    if (!booking) return;

    this.loading.set(true);
    this.adminService.deleteBooking(booking.id).subscribe({
      next: () => {
        this.bookings.update(bookings => bookings.filter(b => b.id !== booking.id));
        this.closeDeleteModal();
        this.loading.set(false);
        this.toastService.success('Reservation supprimee avec succes');
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error("Erreur lors de la suppression de la reservation");
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

  getUserName(booking: Booking): string {
    if (!booking.user) return 'N/A';
    return `${booking.user.nom} ${booking.user.prenom}`;
  }

  getUserEmail(booking: Booking): string {
    if (!booking.user) return 'N/A';
    return booking.user.email;
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

    if (this.modalMode() === 'edit') {
      const booking = this.selectedBooking();
      if (booking) {
        const bookingStart = new Date(booking.startDate);
        bookingStart.setHours(0, 0, 0, 0);
        const bookingEnd = new Date(booking.endDate);
        bookingEnd.setHours(0, 0, 0, 0);

        if (checkDate >= bookingStart && checkDate <= bookingEnd) {
          return false;
        }
      }
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
      this.addForm.patchValue({
        startDate: this.formatDateForInput(selectedDate),
        endDate: '',
      });
    } else {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      if (selectedDate < startDate) {
        this.selectedStartDate.set(selectedDate);
        this.selectedEndDate.set(null);
        this.addForm.patchValue({
          startDate: this.formatDateForInput(selectedDate),
          endDate: '',
        });
      } else {
        const periods = this.reservedPeriods();
        let hasConflict = false;

        for (let d = new Date(startDate); d <= selectedDate; d.setDate(d.getDate() + 1)) {
          const checkDate = new Date(d);
          checkDate.setHours(0, 0, 0, 0);

          if (this.modalMode() === 'edit') {
            const booking = this.selectedBooking();
            if (booking) {
              const bookingStart = new Date(booking.startDate);
              bookingStart.setHours(0, 0, 0, 0);
              const bookingEnd = new Date(booking.endDate);
              bookingEnd.setHours(0, 0, 0, 0);

              if (checkDate >= bookingStart && checkDate <= bookingEnd) {
                continue;
              }
            }
          }

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
          this.addForm.patchValue({
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
