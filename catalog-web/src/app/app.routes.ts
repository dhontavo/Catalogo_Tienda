import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { StoreListComponent } from './components/store-list/store-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  // SaaS Platform Landing Page
  { path: '', component: LandingComponent },

  // Directory of all active stores
  { path: 'stores', component: StoreListComponent },

  // Merchant Authentication & Onboarding
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Merchant SaaS Dashboard
  { path: 'admin', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard', redirectTo: 'admin', pathMatch: 'full' },

  // Public Storefront Catalog per Tenant Store
  { path: 'store/:id_store', component: CatalogComponent },
  { path: ':id_store', component: CatalogComponent },

  // Fallback
  { path: '**', redirectTo: '' },
];
