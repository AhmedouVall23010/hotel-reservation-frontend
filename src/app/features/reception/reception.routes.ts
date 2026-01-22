import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard-overview').then(m => m.DashboardOverviewComponent),
      },
      {
        path: 'rooms-available',
        loadComponent: () => import('./rooms-available/rooms-available').then(m => m.RoomsAvailableComponent),
      },
      {
        path: 'rooms-reserved',
        loadComponent: () => import('./rooms-reserved/rooms-reserved').then(m => m.RoomsReservedComponent),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./bookings/bookings').then(m => m.BookingsComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
