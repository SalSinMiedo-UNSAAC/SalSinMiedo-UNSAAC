import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: 'acceso',
    title: 'Acceso | SalSinMiedo',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/auth-page/auth-page').then(
        (component) => component.AuthPage,
      ),
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio',
      },
      {
        path: 'inicio',
        title: 'Inicio | SalSinMiedo',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
            (component) => component.DashboardPage,
          ),
      },
      {
        path: 'mi-ruta',
        title: 'Mi ruta | SalSinMiedo',
        loadComponent: () =>
          import('./features/route/pages/route-page/route-page').then(
            (component) => component.RoutePage,
          ),
      },
      {
        path: 'requisitos',
        title: 'Requisitos | SalSinMiedo',
        loadComponent: () =>
          import(
            './features/requirements/pages/requirements-page/requirements-page'
          ).then((component) => component.RequirementsPage),
      },
      {
        path: 'verificador',
        title: 'Verificador | SalSinMiedo',
        loadComponent: () =>
          import('./features/verifier/pages/verifier-page/verifier-page').then(
            (component) => component.VerifierPage,
          ),
      },
      {
        path: 'costos',
        title: 'Costos | SalSinMiedo',
        loadComponent: () =>
          import('./features/costs/pages/costs-page/costs-page').then(
            (component) => component.CostsPage,
          ),
      },
      {
        path: 'fuentes',
        title: 'Fuentes oficiales | SalSinMiedo',
        loadComponent: () =>
          import('./features/sources/pages/sources-page/sources-page').then(
            (component) => component.SourcesPage,
          ),
      },
      {
        path: 'notificaciones',
        title: 'Notificaciones | SalSinMiedo',
        loadComponent: () =>
          import(
            './features/notifications/pages/notifications-page/notifications-page'
          ).then((component) => component.NotificationsPage),
      },
      {
        path: 'perfil',
        title: 'Perfil | SalSinMiedo',
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page').then(
            (component) => component.ProfilePage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
