import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { StoreListComponent } from './components/store-list/store-list.component';

export const routes: Routes = [
  { path: '', component: StoreListComponent },
  { path: 'store/:id_store', component: CatalogComponent },
  { path: ':id_store', component: CatalogComponent },
  { path: '**', redirectTo: '' },
];
