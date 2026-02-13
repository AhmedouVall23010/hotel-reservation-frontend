import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/constants/api.constants';
import { environment } from '../../../../environments/environment';
import type { Room } from '../../../shared/types';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
         [class]="scrolled ? 'bg-ivory/95 backdrop-blur-md border-b border-sand/30' : 'bg-transparent'">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex justify-between items-center">
        <a routerLink="/" class="font-serif text-2xl tracking-[0.2em] uppercase"
           [class]="scrolled ? 'text-charcoal' : 'text-white'">
          Tamanokt
        </a>

        <div class="hidden md:flex items-center gap-10">
          <a (click)="scrollTo('rooms')"
             class="text-xs font-sans tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300"
             [class]="scrolled ? 'text-stone hover:text-charcoal' : 'text-white/80 hover:text-white'">
            Chambres
          </a>
          <a (click)="scrollTo('services')"
             class="text-xs font-sans tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300"
             [class]="scrolled ? 'text-stone hover:text-charcoal' : 'text-white/80 hover:text-white'">
            Services
          </a>
          <a (click)="scrollTo('contact')"
             class="text-xs font-sans tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300"
             [class]="scrolled ? 'text-stone hover:text-charcoal' : 'text-white/80 hover:text-white'">
            Contact
          </a>
        </div>

        <div class="flex items-center gap-4">
          <ng-container *ngIf="!isAuthenticated()">
            <a routerLink="/auth/login"
               class="hidden md:inline-block text-xs font-sans tracking-[0.12em] uppercase px-5 py-2.5 border transition-all duration-300"
               [class]="scrolled
                 ? 'border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory'
                 : 'border-white/60 text-white hover:bg-white hover:text-charcoal'">
              Connexion
            </a>
          </ng-container>
          <ng-container *ngIf="isAuthenticated()">
            <a [routerLink]="dashboardLink()"
               class="hidden md:inline-block text-xs font-sans tracking-[0.12em] uppercase px-5 py-2.5 border transition-all duration-300"
               [class]="scrolled
                 ? 'border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory'
                 : 'border-white/60 text-white hover:bg-white hover:text-charcoal'">
              Mon Espace
            </a>
          </ng-container>

          <!-- Hamburger Button (mobile) -->
          <button (click)="toggleMobileMenu()"
                  class="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] group"
                  aria-label="Menu">
            <span class="block w-5 h-[1.5px] transition-all duration-300 origin-center"
                  [class]="mobileMenuOpen
                    ? (scrolled ? 'rotate-45 translate-y-[6.5px] bg-charcoal' : 'rotate-45 translate-y-[6.5px] bg-white')
                    : (scrolled ? 'bg-charcoal' : 'bg-white')"></span>
            <span class="block w-5 h-[1.5px] transition-all duration-300"
                  [class]="mobileMenuOpen
                    ? 'opacity-0 scale-x-0'
                    : (scrolled ? 'bg-charcoal opacity-100' : 'bg-white opacity-100')"></span>
            <span class="block w-5 h-[1.5px] transition-all duration-300 origin-center"
                  [class]="mobileMenuOpen
                    ? (scrolled ? '-rotate-45 -translate-y-[6.5px] bg-charcoal' : '-rotate-45 -translate-y-[6.5px] bg-white')
                    : (scrolled ? 'bg-charcoal' : 'bg-white')"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="md:hidden overflow-hidden transition-all duration-500 ease-out"
           [class]="mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'"
           [style.background]="scrolled ? 'rgba(250,248,244,0.98)' : 'rgba(44,44,44,0.95)'">
        <div class="px-6 py-8 flex flex-col items-center gap-6">
          <a (click)="scrollTo('rooms'); closeMobileMenu()"
             class="text-xs font-sans tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300"
             [class]="scrolled ? 'text-stone hover:text-charcoal' : 'text-white/80 hover:text-white'">
            Chambres
          </a>
          <a (click)="scrollTo('services'); closeMobileMenu()"
             class="text-xs font-sans tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300"
             [class]="scrolled ? 'text-stone hover:text-charcoal' : 'text-white/80 hover:text-white'">
            Services
          </a>
          <a (click)="scrollTo('contact'); closeMobileMenu()"
             class="text-xs font-sans tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300"
             [class]="scrolled ? 'text-stone hover:text-charcoal' : 'text-white/80 hover:text-white'">
            Contact
          </a>
          <div class="w-12 border-t mt-2 mb-2" [class]="scrolled ? 'border-sand/40' : 'border-white/20'"></div>
          <ng-container *ngIf="!isAuthenticated()">
            <a routerLink="/auth/login" (click)="closeMobileMenu()"
               class="text-xs font-sans tracking-[0.12em] uppercase px-8 py-3 border transition-all duration-300"
               [class]="scrolled
                 ? 'border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory'
                 : 'border-white/60 text-white hover:bg-white hover:text-charcoal'">
              Connexion
            </a>
          </ng-container>
          <ng-container *ngIf="isAuthenticated()">
            <a [routerLink]="dashboardLink()" (click)="closeMobileMenu()"
               class="text-xs font-sans tracking-[0.12em] uppercase px-8 py-3 border transition-all duration-300"
               [class]="scrolled
                 ? 'border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory'
                 : 'border-white/60 text-white hover:bg-white hover:text-charcoal'">
              Mon Espace
            </a>
          </ng-container>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-[#3D3835] to-[#4A3F3A]">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative text-center px-6">
        <p class="font-sans text-xs tracking-[0.3em] uppercase text-sand mb-6">Bienvenue</p>
        <h1 class="font-serif text-6xl md:text-8xl lg:text-9xl font-light text-white mb-8 tracking-wide">
          Tamanokt
        </h1>
        <p class="font-sans text-sm md:text-base font-light text-white/70 max-w-lg mx-auto mb-12 leading-relaxed">
          Un refuge d'elegance ou chaque detail est pense pour votre confort.
        </p>
        <button (click)="scrollTo('rooms')"
                class="font-sans text-xs tracking-[0.15em] uppercase px-10 py-4 border border-white/50 text-white hover:bg-white hover:text-charcoal transition-all duration-500">
          Decouvrir nos chambres
        </button>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="py-24 lg:py-32 bg-cream">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <p class="font-sans text-xs tracking-[0.2em] uppercase text-stone text-center mb-4">L'Experience</p>
        <h2 class="font-serif text-4xl md:text-5xl font-light text-charcoal text-center mb-20">Nos Services</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-taupe" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
              </svg>
            </div>
            <h3 class="font-serif text-xl text-charcoal mb-3">Wi-Fi Haut Debit</h3>
            <p class="font-sans text-sm text-stone font-light leading-relaxed">Connexion fibre optique dans toutes les chambres et espaces.</p>
          </div>

          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-taupe" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="font-serif text-xl text-charcoal mb-3">Conciergerie 24h</h3>
            <p class="font-sans text-sm text-stone font-light leading-relaxed">Un service attentionne, disponible jour et nuit pour vous.</p>
          </div>

          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-taupe" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
            </div>
            <h3 class="font-serif text-xl text-charcoal mb-3">Gastronomie</h3>
            <p class="font-sans text-sm text-stone font-light leading-relaxed">Une cuisine raffinee sublimant les saveurs locales.</p>
          </div>

          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-taupe" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <h3 class="font-serif text-xl text-charcoal mb-3">Bien-Etre</h3>
            <p class="font-sans text-sm text-stone font-light leading-relaxed">Piscine, spa et soins pour une detente absolue.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Rooms -->
    <section id="rooms" class="py-24 lg:py-32 bg-ivory">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <p class="font-sans text-xs tracking-[0.2em] uppercase text-stone text-center mb-4">Hebergement</p>
        <h2 class="font-serif text-4xl md:text-5xl font-light text-charcoal text-center mb-6">Nos Chambres</h2>
        <p class="font-sans text-sm text-stone font-light text-center max-w-md mx-auto mb-16 leading-relaxed">
          Chaque chambre est un ecrin de serenite, ou le raffinement se vit dans chaque detail.
        </p>

        <!-- Loading -->
        <div *ngIf="loading()" class="flex justify-center items-center h-48">
          <div class="w-8 h-8 border border-sand border-t-taupe rounded-full animate-spin"></div>
        </div>

        <!-- Error -->
        <div *ngIf="error()" class="text-center py-12">
          <p class="font-sans text-sm text-stone">{{ error() }}</p>
        </div>

        <!-- Rooms Grid -->
        <div *ngIf="!loading() && !error()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <a *ngFor="let room of rooms()"
             [routerLink]="['/room', room.id]"
             class="group block">
            <div class="overflow-hidden mb-5">
              <img [src]="getRoomImageUrl(room)"
                   [alt]="'Chambre ' + room.roomNumber"
                   class="w-full h-64 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            </div>
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-serif text-xl text-charcoal">Chambre {{ room.roomNumber }}</h3>
              <span class="font-sans text-xs tracking-[0.1em] uppercase px-3 py-1"
                    [class]="room.available ? 'text-success bg-success/10' : 'text-error bg-error/10'">
                {{ room.available ? 'Disponible' : 'Occupee' }}
              </span>
            </div>
            <p class="font-sans text-xs tracking-[0.1em] uppercase text-stone mb-2">{{ room.type }}</p>
            <p class="font-sans text-sm text-stone font-light mb-4 line-clamp-2 leading-relaxed">{{ room.description }}</p>
            <div class="flex justify-between items-center">
              <span class="font-serif text-lg text-gold">{{ room.price }} MRU <span class="font-sans text-xs text-stone font-light">/ nuit</span></span>
              <span class="font-sans text-xs tracking-[0.12em] uppercase text-taupe group-hover:text-charcoal transition-colors duration-300">
                Voir details &rarr;
              </span>
            </div>
          </a>
        </div>

        <!-- Empty -->
        <div *ngIf="!loading() && !error() && rooms().length === 0" class="text-center py-16">
          <p class="font-sans text-sm text-stone font-light">Aucune chambre disponible pour le moment.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-charcoal py-20">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div>
            <h3 class="font-serif text-2xl tracking-[0.15em] uppercase text-white mb-6">Tamanokt</h3>
            <p class="font-sans text-sm text-sand/70 font-light leading-relaxed">
              Un refuge d'elegance ou chaque detail est pense pour votre confort et votre serenite.
            </p>
          </div>
          <div>
            <h4 class="font-sans text-xs tracking-[0.15em] uppercase text-sand mb-6">Navigation</h4>
            <ul class="space-y-3">
              <li><a routerLink="/" class="font-sans text-sm text-sand/70 hover:text-white transition-colors duration-300 font-light">Accueil</a></li>
              <li><a (click)="scrollTo('rooms')" class="font-sans text-sm text-sand/70 hover:text-white transition-colors duration-300 font-light cursor-pointer">Chambres</a></li>
              <li><a routerLink="/auth/login" class="font-sans text-sm text-sand/70 hover:text-white transition-colors duration-300 font-light">Connexion</a></li>
              <li><a routerLink="/auth/register" class="font-sans text-sm text-sand/70 hover:text-white transition-colors duration-300 font-light">Inscription</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-sans text-xs tracking-[0.15em] uppercase text-sand mb-6">Contact</h4>
            <ul class="space-y-3 font-sans text-sm text-sand/70 font-light">
              <li>contact&#64;tamanokt.com</li>
              <li>+222 XX XX XX XX</li>
              <li>Nouakchott, Mauritanie</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-stone/20 pt-8">
          <p class="font-sans text-xs text-stone/60 text-center tracking-wide">&copy; 2026 Tamanokt. Tous droits reserves.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LandingComponent implements OnInit {
  private publicService = inject(PublicService);
  private authService = inject(AuthService);

  rooms = signal<Room[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  scrolled = false;
  mobileMenuOpen = false;

  ngOnInit() {
    this.loadRooms();
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled = window.scrollY > 50;
      });
    }
  }

  loadRooms() {
    this.loading.set(true);
    this.error.set(null);
    this.publicService.getAllRooms().subscribe({
      next: (rooms) => { this.rooms.set(rooms); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les chambres.'); this.loading.set(false); }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated() || !!this.authService.getToken();
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

  logout() { this.authService.logout(); }

  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMobileMenu() { this.mobileMenuOpen = false; }

  getRoomImageUrl(room: Room): string {
    if (!room.imageUrl) return '/assets/default-room.jpg';
    if (room.imageUrl.startsWith('http')) return room.imageUrl;
    return `${environment.apiUrl}${room.imageUrl}`;
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
