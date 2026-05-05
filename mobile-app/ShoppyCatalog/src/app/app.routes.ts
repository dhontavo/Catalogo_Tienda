import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'new-account',
    loadComponent: () => import('./pages/new-account/new-account.page').then(m => m.NewAccountPage)
  },
  // {
  //   path: 'add-product',
  //   loadComponent: () => import('./modal/add-product/add-product.page').then(m => m.AddProductPage)
  // },
  {
    path: 'lost-pass',


    loadComponent: () => import('./pages/lost-pass/lost-pass.page').then(m => m.LostPassPage)
  },

];
