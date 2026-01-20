import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export function authInitializer(): () => Promise<void> {
  return () => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    return new Promise<void>((resolve) => {
      if (!isPlatformBrowser(platformId)) {
        resolve();
        return;
      }

      setTimeout(() => {
        router.navigate(['/loading'], { replaceUrl: true });
        resolve();
      }, 0);
    });
  };
}