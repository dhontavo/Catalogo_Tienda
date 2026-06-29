import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';

export const routes: Routes = [
  { path: '', component: CatalogComponent },
  { path: 'store/:id_store', component: CatalogComponent },
  { path: ':id_store', component: CatalogComponent },
  { path: '**', redirectTo: '' },
];

