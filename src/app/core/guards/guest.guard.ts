import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../constants/api.constants';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const user = authService.getCurrentUser();
  if (!user) {
    return true;
  }

  switch (user.role) {
    case UserRole.ADMIN:
      router.navigate(['/admin/dashboard'], { replaceUrl: true });
      break;
    case UserRole.RECEPTION:
      router.navigate(['/reception/dashboard'], { replaceUrl: true });
      break;
    case UserRole.USER:
      router.navigate(['/client/dashboard'], { replaceUrl: true });
      break;
  }

  return false;
};