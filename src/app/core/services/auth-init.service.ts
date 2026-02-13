import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export function authInitializer(): () => Promise<void> {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return;
    }

    await authService.initializeAuth();

    const currentPath = window.location.pathname;
    if (currentPath === '/loading') {
      router.navigate(['/loading'], { replaceUrl: true });
    }
  };
}