import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard-overview').then(m => m.DashboardOverviewComponent),
      },
      {
        path: 'rooms',
        loadComponent: () => import('./rooms/rooms').then(m => m.RoomsComponent),
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
