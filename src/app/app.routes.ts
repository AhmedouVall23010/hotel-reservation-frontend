import { Routes } from '@angular/router';
import { authGuard, roleGuard, initialLoadGuard } from './core/guards';
import { guestGuard } from './core/guards/guest.guard';
import { UserRole } from './core/constants/api.constants';

export const routes: Routes = [
  {
    path: 'loading',
    canActivate: [initialLoadGuard],
    loadComponent: () => import('./shared/components/loading/loading').then(m => m.Loading),
  },
  // Public routes (no authentication required)
  {
    path: 'rooms',
    loadComponent: () => import('./features/public/rooms/public-rooms.component').then(m => m.PublicRoomsComponent),
  },
  {
    path: 'room/:id',
    loadComponent: () => import('./features/public/room-detail/room-detail.component').then(m => m.RoomDetailComponent),
  },
  {
    path: 'auth',
    loadComponent: () => import('./shared/components/layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.routes),
  },
  {
    path: 'reception',
    canActivate: [authGuard, roleGuard([UserRole.RECEPTION])],
    loadChildren: () => import('./features/reception/reception.routes').then(m => m.routes),
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard([UserRole.USER])],
    loadChildren: () => import('./features/client/client.routes').then(m => m.routes),
  },
  {
    path: '',
    redirectTo: '/loading',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/loading',
  },
];