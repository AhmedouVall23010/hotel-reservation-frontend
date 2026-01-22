import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceptionService } from '../../../core/services/reception.service';
import { environment } from '../../../../environments/environment';
import type { Room } from '../../../shared/types';

@Component({
  selector: 'app-rooms-reserved',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms-reserved.html',
  styleUrl: './rooms-reserved.css',
})
export class RoomsReservedComponent implements OnInit {
  private receptionService = inject(ReceptionService);

  rooms = signal<Room[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.receptionService.getRoomsReserved().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${environment.apiUrl}${imageUrl}`;
  }
}
