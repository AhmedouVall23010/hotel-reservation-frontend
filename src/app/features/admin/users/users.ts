import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { UserRole } from '../../../core/constants/api.constants';
import type { User, AdminAddUserRequest, AdminUpdateUserRequest } from '../../../shared/types';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  loading = signal(false);
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  selectedUser = signal<User | null>(null);
  userToDelete = signal<User | null>(null);
  actionStatus = signal<'idle' | 'success' | 'error'>('idle');

  addForm: FormGroup;
  editForm: FormGroup;

  roles = [UserRole.ADMIN, UserRole.RECEPTION, UserRole.USER];

  constructor() {
    this.addForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.USER, [Validators.required]],
    });

    this.editForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: [UserRole.USER, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.addForm.reset({
      role: UserRole.USER,
    });
    this.showAddModal.set(true);
    this.actionStatus.set('idle');
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.addForm.reset();
  }

  openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.editForm.patchValue({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      password: '',
    });
    this.showEditModal.set(true);
    this.actionStatus.set('idle');
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
    this.editForm.reset();
  }

  addUser(): void {
    if (this.addForm.invalid) {
      this.markFormGroupTouched(this.addForm);
      return;
    }

    this.loading.set(true);
    const userData: AdminAddUserRequest = this.addForm.value;

    this.adminService.addUser(userData).subscribe({
      next: () => {
        this.actionStatus.set('success');
        this.loadUsers();
        setTimeout(() => {
          this.closeAddModal();
        }, 1000);
      },
      error: () => {
        this.actionStatus.set('error');
        this.loading.set(false);
      },
    });
  }

  updateUser(): void {
    if (this.editForm.invalid || !this.selectedUser()) {
      return;
    }

    this.loading.set(true);
    const formValue = this.editForm.value;
    const userData: AdminUpdateUserRequest = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: formValue.email,
      role: formValue.role,
      ...(formValue.password && { password: formValue.password }),
    };

    this.adminService.updateUser(this.selectedUser()!.id, userData).subscribe({
      next: () => {
        this.actionStatus.set('success');
        this.loadUsers();
        setTimeout(() => {
          this.closeEditModal();
        }, 1000);
      },
      error: () => {
        this.actionStatus.set('error');
        this.loading.set(false);
      },
    });
  }

  deleteUser(user: User): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.loading.set(true);
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update(users => users.filter(u => u.id !== user.id));
        this.closeDeleteModal();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrateur',
      [UserRole.RECEPTION]: 'Réception',
      [UserRole.USER]: 'Utilisateur',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.RECEPTION]: 'bg-blue-100 text-blue-800',
      [UserRole.USER]: 'bg-green-100 text-green-800',
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
