import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => {
      this.checkAuthAndRedirect();
    }, 500);
  }

  private checkAuthAndRedirect(): void {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();

    if (token && user) {
      switch (user.role) {
        case UserRole.ADMIN:
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
          break;
        case UserRole.RECEPTION:
          this.router.navigate(['/reception/dashboard'], { replaceUrl: true });
          break;
        case UserRole.USER:
          this.router.navigate(['/client/dashboard'], { replaceUrl: true });
          break;
        default:
          this.router.navigate(['/'], { replaceUrl: true });
      }
    } else {
      this.router.navigate(['/'], { replaceUrl: true });
    }
  }
}