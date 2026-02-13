import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/constants/api.constants';
import { environment } from '../../../../environments/environment';
import type { Room } from '../../../shared/types';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-ivory">
      <!-- Navbar -->
      <nav class="bg-ivory border-b border-sand/30">
        <div class="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex justify-between items-center">
          <a routerLink="/" class="font-serif text-2xl tracking-[0.2em] uppercase text-charcoal">Tamanokt</a>

          <div class="hidden md:flex items-center gap-10">
            <a routerLink="/"
               class="text-xs font-sans tracking-[0.15em] uppercase text-stone hover:text-charcoal transition-colors duration-300">
              Accueil
            </a>
          </div>

          <div class="flex items-center gap-4">
            <ng-container *ngIf="!isAuthenticated()">
              <a routerLink="/auth/login"
                 class="hidden md:inline-block text-xs font-sans tracking-[0.12em] uppercase px-5 py-2.5 border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-300">
                Connexion
              </a>
            </ng-container>
            <ng-container *ngIf="isAuthenticated()">
              <a [routerLink]="dashboardLink()"
                 class="hidden md:inline-block text-xs font-sans tracking-[0.12em] uppercase px-5 py-2.5 border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-300">
                Mon Espace
              </a>
            </ng-container>

            <!-- Hamburger (mobile) -->
            <button (click)="mobileMenuOpen = !mobileMenuOpen"
                    class="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
                    aria-label="Menu">
              <span class="block w-5 h-[1.5px] bg-charcoal transition-all duration-300 origin-center"
                    [class]="mobileMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''"></span>
              <span class="block w-5 h-[1.5px] bg-charcoal transition-all duration-300"
                    [class]="mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'"></span>
              <span class="block w-5 h-[1.5px] bg-charcoal transition-all duration-300 origin-center"
                    [class]="mobileMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''"></span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div class="md:hidden overflow-hidden transition-all duration-500 ease-out bg-ivory"
             [class]="mobileMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'">
          <div class="px-6 py-8 flex flex-col items-center gap-6">
            <a routerLink="/" (click)="mobileMenuOpen = false"
               class="text-xs font-sans tracking-[0.15em] uppercase text-stone hover:text-charcoal transition-colors duration-300">
              Accueil
            </a>
            <div class="w-12 border-t border-sand/40 mt-2 mb-2"></div>
            <ng-container *ngIf="!isAuthenticated()">
              <a routerLink="/auth/login" (click)="mobileMenuOpen = false"
                 class="text-xs font-sans tracking-[0.12em] uppercase px-8 py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-300">
                Connexion
              </a>
            </ng-container>
            <ng-container *ngIf="isAuthenticated()">
              <a [routerLink]="dashboardLink()" (click)="mobileMenuOpen = false"
                 class="text-xs font-sans tracking-[0.12em] uppercase px-8 py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-300">
                Mon Espace
              </a>
            </ng-container>
          </div>
        </div>
      </nav>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center items-center h-64">
        <div class="w-8 h-8 border border-sand border-t-taupe rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="max-w-6xl mx-auto px-6 lg:px-12 py-8">
        <div class="py-3 px-4 border border-error/30 bg-error/5">
          <p class="font-sans text-sm text-error">{{ error() }}</p>
        </div>
      </div>

      <!-- Room Details -->
      <div *ngIf="room() && !loading()" class="max-w-6xl mx-auto px-6 lg:px-12 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Image -->
          <div class="h-[28rem] lg:h-auto overflow-hidden">
            <img [src]="getRoomImageUrl(room()!)"
                 [alt]="'Chambre ' + room()!.roomNumber"
                 class="w-full h-full object-cover">
          </div>

          <!-- Info -->
          <div class="py-2">
            <div class="flex justify-between items-start mb-4">
              <h1 class="font-serif text-4xl font-light text-charcoal">Chambre {{ room()!.roomNumber }}</h1>
              <span class="px-3 py-1 font-sans text-xs tracking-[0.05em] uppercase"
                    [class]="room()!.available ? 'bg-success/10 text-success' : 'bg-error/10 text-error'">
                {{ room()!.available ? 'Disponible' : 'Occupee' }}
              </span>
            </div>

            <p class="font-sans text-xs tracking-[0.1em] uppercase text-stone mb-4">{{ room()!.type }}</p>
            <p class="font-sans text-sm text-stone font-light leading-relaxed mb-8">{{ room()!.description }}</p>

            <div class="border-t border-linen pt-6 mb-8">
              <p class="font-serif text-3xl text-gold">{{ room()!.price }} MRU <span class="font-sans text-xs text-stone font-light tracking-wide">/ nuit</span></p>
            </div>

            <!-- Reserved Dates Calendar -->
            <div class="border-t border-linen pt-8 mb-8">
              <h3 class="font-serif text-xl text-charcoal mb-6">Disponibilite</h3>

              <div *ngIf="loadingDates()" class="flex justify-center items-center py-12">
                <div class="w-6 h-6 border border-sand border-t-taupe rounded-full animate-spin"></div>
              </div>

              <div *ngIf="!loadingDates()" class="bg-cream/30 border border-linen p-6">
                <div class="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    (click)="previousMonth()"
                    class="p-2 rounded-full hover:bg-cream/50 transition-all duration-300 hover:scale-110"
                  >
                    <svg class="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h4 class="font-serif text-xl text-charcoal capitalize font-light">{{ getMonthName() }}</h4>
                  <button
                    type="button"
                    (click)="nextMonth()"
                    class="p-2 rounded-full hover:bg-cream/50 transition-all duration-300 hover:scale-110"
                  >
                    <svg class="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div class="grid grid-cols-7 gap-1 mb-3">
                  <div class="text-center font-sans text-xs tracking-[0.12em] uppercase text-stone font-medium py-2">Lun</div>
                  <div class="text-center font-sans text-xs tracking-[0.12em] uppercase text-stone font-medium py-2">Mar</div>
                  <div class="text-center font-sans text-xs tracking-[0.12em] uppercase text-stone font-medium py-2">Mer</div>
                  <div class="text-center font-sans text-xs tracking-[0.12em] uppercase text-stone font-medium py-2">Jeu</div>
                  <div class="text-center font-sans text-xs tracking-[0.12em] uppercase text-stone font-medium py-2">Ven</div>
                  <div class="text-center font-sans text-xs tracking-[0.12em] uppercase text-stone font-medium py-2">Sam</div>
                  <div class="text-center font-sans text-xs tracking-[0.12em] uppercase text-stone font-medium py-2">Dim</div>
                </div>

                <div class="grid grid-cols-7 gap-1.5">
                  <div *ngFor="let day of getCalendarDays()"
                       [class]="'aspect-square flex items-center justify-center text-sm font-sans rounded transition-all duration-300 ' +
                         (isDateReserved(day)
                           ? 'bg-error/15 text-error border border-error/20'
                           : day.getMonth() !== calendarDate().getMonth()
                           ? 'text-sand/40'
                           : 'text-charcoal hover:bg-cream/50')">
                    {{ day.getDate() }}
                  </div>
                </div>

                <div class="mt-6 pt-4 border-t border-linen">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 bg-error/15 border border-error/20 rounded"></div>
                    <span class="font-sans text-xs text-stone font-light">Date indisponible</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-4">
              <button *ngIf="room()!.available && isAuthenticated()"
                      (click)="bookRoom()"
                      class="flex-1 py-4 font-sans text-xs tracking-[0.15em] uppercase bg-taupe text-cream hover:bg-taupe/90 transition-all duration-500">
                Reserver maintenant
              </button>

              <button *ngIf="room()!.available && !isAuthenticated()"
                      (click)="navigateToLogin()"
                      class="flex-1 py-4 font-sans text-xs tracking-[0.15em] uppercase border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-500">
                Se connecter pour reserver
              </button>

              <button *ngIf="!room()!.available"
                      disabled
                      class="flex-1 py-4 font-sans text-xs tracking-[0.15em] uppercase bg-sand/30 text-stone cursor-not-allowed">
                Non disponible
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RoomDetailComponent implements OnInit {
  private publicService = inject(PublicService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  room = signal<Room | null>(null);
  reservedDates = signal<Array<{ startDate: string; endDate: string }>>([]);
  loading = signal(false);
  loadingDates = signal(false);
  error = signal<string | null>(null);
  mobileMenuOpen = false;
  calendarDate = signal<Date>(new Date());

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

  dashboardLink(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '/';
    switch (user.role) {
      case UserRole.ADMIN: return '/admin/dashboard';
      case UserRole.RECEPTION: return '/reception/dashboard';
      case UserRole.USER: return '/client/dashboard';
      default: return '/';
    }
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

  getRoomImageUrl(room: Room): string {
    if (!room.imageUrl) return '/assets/default-room.jpg';
    if (room.imageUrl.startsWith('http')) return room.imageUrl;
    return `${environment.apiUrl}${room.imageUrl}`;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getCalendarDays(): Date[] {
    const year = this.calendarDate().getFullYear();
    const month = this.calendarDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push(new Date(year, month, -adjustedStartingDay + i + 1));
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

  isDateReserved(date: Date): boolean {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return false;
    }

    const periods = this.reservedDates();
    for (const period of periods) {
      const periodStart = new Date(period.startDate);
      periodStart.setHours(0, 0, 0, 0);
      const periodEnd = new Date(period.endDate);
      periodEnd.setHours(0, 0, 0, 0);

      if (checkDate >= periodStart && checkDate <= periodEnd) {
        return true;
      }
    }

    return false;
  }
}