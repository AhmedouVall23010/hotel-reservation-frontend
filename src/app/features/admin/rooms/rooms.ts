import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import type { Room, AdminAddRoomRequest, AdminUpdateRoomRequest } from '../../../shared/types';

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class RoomsComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  rooms = signal<Room[]>([]);
  loading = signal(false);
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  selectedRoom = signal<Room | null>(null);
  originalRoomData = signal<Room | null>(null);
  roomToDelete = signal<Room | null>(null);

  addForm: FormGroup;
  editForm: FormGroup;

  roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${environment.apiUrl}${imageUrl}`;
  }

  constructor() {
    this.addForm = this.fb.group({
      roomNumber: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required]],
      type: ['Standard', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      image: [null, [Validators.required]],
    });

    this.editForm = this.fb.group({
      roomNumber: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required]],
      type: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      image: [null],
    });
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.adminService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les chambres');
      },
    });
  }

  openAddModal(): void {
    this.addForm.reset({
      type: 'Standard',
    });
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.addForm.reset();
  }

  openEditModal(room: Room): void {
    this.selectedRoom.set(room);
    this.originalRoomData.set({ ...room });
    this.editForm.patchValue({
      roomNumber: room.roomNumber,
      description: room.description,
      type: room.type || '',
      price: room.price,
      image: null,
    });
    this.editForm.get('type')?.setValue(room.type);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedRoom.set(null);
    this.originalRoomData.set(null);
    this.editForm.reset();
  }

  onAddImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addForm.patchValue({ image: input.files[0] });
    }
  }

  onEditImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editForm.patchValue({ image: input.files[0] });
    }
  }

  addRoom(): void {
    if (this.addForm.invalid) {
      this.markFormGroupTouched(this.addForm);
      return;
    }

    this.loading.set(true);
    const roomData: AdminAddRoomRequest = {
      roomNumber: Number(this.addForm.value.roomNumber),
      description: this.addForm.value.description,
      type: this.addForm.value.type,
      price: Number(this.addForm.value.price),
      image: this.addForm.value.image,
    };

    this.adminService.addRoom(roomData).subscribe({
      next: () => {
        this.toastService.success('Chambre ajoutee avec succes');
        this.loadRooms();
        this.closeAddModal();
      },
      error: () => {
        this.toastService.error("Erreur lors de l'ajout de la chambre");
        this.loading.set(false);
      },
    });
  }

  updateRoom(): void {
    if (this.editForm.invalid || !this.selectedRoom() || !this.originalRoomData()) {
      this.markFormGroupTouched(this.editForm);
      if (this.editForm.invalid) {
        this.toastService.error('Veuillez remplir tous les champs requis');
      }
      return;
    }

    this.loading.set(true);
    const formValue = this.editForm.value;
    const original = this.originalRoomData()!;
    
    // Build roomData object with only changed fields
    const roomData: AdminUpdateRoomRequest = {} as AdminUpdateRoomRequest;

    // Only include fields that have changed
    const newRoomNumber = Number(formValue.roomNumber);
    if (newRoomNumber !== original.roomNumber) {
      (roomData as any).roomNumber = newRoomNumber;
    }

    if (formValue.description !== original.description) {
      (roomData as any).description = formValue.description;
    }

    if (formValue.type !== original.type) {
      (roomData as any).type = formValue.type;
    }

    const newPrice = Number(formValue.price);
    if (newPrice !== original.price) {
      (roomData as any).price = newPrice;
    }

    if (formValue.image) {
      (roomData as any).image = formValue.image;
    }

    // Check if there are any changes
    if (Object.keys(roomData).length === 0) {
      this.toastService.error('Aucune modification detectee');
      this.loading.set(false);
      return;
    }

    this.adminService.updateRoom(this.selectedRoom()!.id, roomData).subscribe({
      next: () => {
        this.toastService.success('Chambre modifiee avec succes');
        this.loadRooms();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating room:', error);
        let errorMessage = 'Erreur lors de la modification de la chambre';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Donnees invalides';
        } else if (error.status === 404) {
          errorMessage = 'Chambre introuvable';
        }
        this.toastService.error(errorMessage);
        this.loading.set(false);
      },
    });
  }

  deleteRoom(room: Room): void {
    this.roomToDelete.set(room);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.roomToDelete.set(null);
  }

  confirmDelete(): void {
    const room = this.roomToDelete();
    if (!room) return;

    this.loading.set(true);
    this.adminService.deleteRoom(room.id).subscribe({
      next: () => {
        this.rooms.update(rooms => rooms.filter(r => r.id !== room.id));
        this.closeDeleteModal();
        this.loading.set(false);
        this.toastService.success('Chambre supprimee avec succes');
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Erreur lors de la suppression de la chambre');
      },
    });
  }

  toggleRoomStatus(room: Room): void {
    this.loading.set(true);
    this.adminService.changeRoomStatus(room.id).subscribe({
      next: () => {
        this.loadRooms();
        this.toastService.success(room.available ? 'Chambre desactivee' : 'Chambre activee');
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Erreur lors du changement de statut');
      },
    });
  }

  getStatusBadgeClass(available: boolean): string {
    return available
      ? 'bg-success/90 text-cream'
      : 'bg-error/90 text-cream';
  }

  getStatusLabel(available: boolean): string {
    return available ? 'Disponible' : 'Non disponible';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
