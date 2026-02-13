import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../constants/api.constants';

export const initialLoadGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthStateReady()) {
    return true;
  }

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case UserRole.ADMIN:
          router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
          break;
        case UserRole.RECEPTION:
          router.navigateByUrl('/reception/dashboard', { replaceUrl: true });
          break;
        case UserRole.USER:
          router.navigateByUrl('/client/dashboard', { replaceUrl: true });
          break;
      }
      return false;
    }
  }

  router.navigateByUrl('/', { replaceUrl: true });
  return false;
};
