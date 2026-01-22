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
        path: 'users',
        loadComponent: () => import('./users/users').then(m => m.UsersComponent),
      },
      {
        path: 'rooms',
        loadComponent: () => import('./rooms/rooms').then(m => m.RoomsComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
