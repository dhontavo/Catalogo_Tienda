import {
  Component, OnInit, OnDestroy, inject,
  PLATFORM_ID, signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { CatalogService, Store } from '../../services/catalog.service';

const FALLBACK_IMG = 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-list.component.html',
})
export class StoreListComponent implements OnInit, OnDestroy {
  private catalogSvc = inject(CatalogService);
  private router = inject(Router);
  private titleSvc = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // ─── State ────────────────────────────────────────────────────
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  stores = signal<Store[]>([]);
  gridVisible = false;
  currentYear = new Date().getFullYear();

  private subs = new Subscription();

  // ─── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.titleSvc.setTitle('Catálogo de Tiendas');
    this.loadStores();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ─── Data Loading ─────────────────────────────────────────────
  private loadStores(): void {
    this.subs.add(
      this.catalogSvc.getStores().subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res.success) {
            this.errorMsg.set('Error al cargar las tiendas.');
            return;
          }
          if (!res.data || res.data.length === 0) {
            this.errorMsg.set('No hay tiendas disponibles en este momento.');
            return;
          }
          this.stores.set(res.data);
          setTimeout(() => (this.gridVisible = true), 100);
        },
        error: () => {
          this.loading.set(false);
          this.errorMsg.set('No se pudo conectar con el servidor.');
        },
      })
    );
  }

  // ─── Navigation ───────────────────────────────────────────────
  goToStore(store: Store): void {
    this.router.navigate(['/', store.id]);
  }

  // ─── Helpers ──────────────────────────────────────────────────
  getStoreImage(store: Store): string {
    return store.image?.trim() ? store.image : FALLBACK_IMG;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMG;
  }

  getPrimaryColor(store: Store): string {
    if (store.colors) {
      try {
        const colors: string[] = JSON.parse(store.colors);
        if (Array.isArray(colors) && colors.length >= 1) {
          return colors[0];
        }
      } catch { }
    }
    return '#6366f1';
  }

  getGradientStyle(store: Store): string {
    const color = this.getPrimaryColor(store);
    return `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`;
  }

  getAccentBorder(store: Store): string {
    const color = this.getPrimaryColor(store);
    return `3px solid ${color}`;
  }
}
