import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user = signal(this.authService.getCurrentUser());
  sidebarOpen = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }
}
