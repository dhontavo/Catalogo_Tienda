import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'new-account',
    loadComponent: () => import('./new-account/new-account.page').then( m => m.NewAccountPage)
  },
  {
    path: 'add-product',
    loadComponent: () => import('./add-product/add-product.page').then( m => m.AddProductPage)
  },
  {
    path: 'lost-pass',
    loadComponent: () => import('./lost-pass/lost-pass.page').then( m => m.LostPassPage)
  },

];
