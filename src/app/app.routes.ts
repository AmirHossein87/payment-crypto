import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'checkout',
    data: { title: 'Pay with Crypto' },
    loadComponent: () =>
      import('./features/checkout/checkout.page').then((m) => m.CheckoutPage),
  },

  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: 'result',
     data: { title: 'Payment Result' },
    loadComponent: () =>
      import('./features/results/results.component').then((m) => m.ResultPage),
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },

];
