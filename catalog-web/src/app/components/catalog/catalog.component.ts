import {
  Component, OnInit, OnDestroy, inject,
  PLATFORM_ID, signal, computed, effect
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { CatalogService, Product, Store } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { CartModalComponent } from '../cart-modal/cart-modal.component';

const FALLBACK_IMG = 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ProductModalComponent, CartModalComponent],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit, OnDestroy {
  private route       = inject(ActivatedRoute);
  private catalogSvc  = inject(CatalogService);
  readonly cartSvc    = inject(CartService);
  private titleSvc    = inject(Title);
  private platformId  = inject(PLATFORM_ID);
  private isBrowser   = isPlatformBrowser(this.platformId);

  // ─── State ────────────────────────────────────────────────────────────────
  idStore   = '';
  loading   = signal(true);
  errorMsg  = signal<string | null>(null);
  products  = signal<Product[]>([]);
  store     = signal<Store | null>(null);

  selectedProduct = signal<Product | null>(null);
  cartOpen        = signal(false);
  gridVisible     = false;

  private subs = new Subscription();

  // ─── Toast ────────────────────────────────────────────────────────────────
  toastMsg    = signal('');
  toastActive = signal(false);
  private toastTimer?: ReturnType<typeof setTimeout>;

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.idStore = this.route.snapshot.queryParamMap.get('id_store') ?? '';

    if (!this.idStore) {
      this.loading.set(false);
      this.errorMsg.set('Enlace inválido. Por favor proporciona el id_store en la URL.');
      return;
    }

    // Cargar tienda + productos
    this.subs.add(
      this.catalogSvc.getStore(this.idStore).subscribe({
        next: (res) => {
          if (!res.success || !res.data) {
            this.setError('Tienda no encontrada.');
            return;
          }
          this.store.set(res.data);
          this.applyStoreTheme(res.data);
          this.titleSvc.setTitle(`${res.data.store ?? 'Tienda'} - Catálogo`);
          this.loadProducts();
        },
        error: () => this.setError('No se pudo conectar con el servidor.'),
      })
    );

    // Escuchar teclado para cerrar modales (solo en browser)
    if (this.isBrowser) {
      document.addEventListener('keydown', this.onKeydown);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.isBrowser) {
      document.removeEventListener('keydown', this.onKeydown);
    }
    clearTimeout(this.toastTimer);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private loadProducts(): void {
    this.subs.add(
      this.catalogSvc.getProducts(this.idStore).subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res.success) { this.errorMsg.set('Error al cargar los productos.'); return; }
          if (res.data.length === 0) { this.errorMsg.set('Esta tienda aún no tiene productos disponibles.'); return; }
          this.products.set(res.data);
          this.cartSvc.load(this.idStore);
          // Trigger animation
          setTimeout(() => (this.gridVisible = true), 100);
        },
        error: () => {
          this.loading.set(false);
          this.setError('Error al cargar los productos.');
        },
      })
    );
  }

  private setError(msg: string): void {
    this.loading.set(false);
    this.errorMsg.set(msg);
  }

  // ─── Theme ────────────────────────────────────────────────────────────────
  private applyStoreTheme(store: Store): void {
    if (!this.isBrowser) return;

    let primaryColor = '#0058b8';
    let gradientStart = '#e0efff';
    let gradientEnd = '#f8f9fb';

    if (store.colors) {
      try {
        const colors: string[] = JSON.parse(store.colors);
        if (Array.isArray(colors) && colors.length >= 1) {
          primaryColor = colors[0];
          const rgb = this.hexToRgb(primaryColor);
          const [r, g, b] = rgb.split(',').map(Number);
          gradientStart = `rgba(${r},${g},${b},0.06)`;
          gradientEnd   = `rgba(${r},${g},${b},0.15)`;
        }
      } catch {}
    }

    const rgb = this.hexToRgb(primaryColor);
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-color-hover', this.adjustColor(primaryColor, -20));
    root.style.setProperty('--primary-color-rgb', rgb);
    root.style.setProperty('--bg-gradient-start', gradientStart);
    root.style.setProperty('--bg-gradient-end', gradientEnd);
    const [r, g, b] = rgb.split(',').map(Number);
    root.style.setProperty('--card-border', `rgba(${r},${g},${b},0.18)`);

    // Favicon dinámico
    if (store.image) {
      let link = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.id = 'dynamic-favicon';
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = store.image;
    }
  }

  private hexToRgb(hex: string): string {
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      let c = hex.substring(1).split('');
      if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      const val = parseInt('0x' + c.join(''), 16);
      return [(val >> 16) & 255, (val >> 8) & 255, val & 255].join(',');
    }
    return '99,102,241';
  }

  private adjustColor(color: string, amount: number): string {
    return '#' + color.replace(/^#/, '').replace(/../g, c =>
      ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).slice(-2)
    );
  }

  // ─── Product Modal ────────────────────────────────────────────────────────
  openProductModal(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
  }

  // ─── Cart ─────────────────────────────────────────────────────────────────
  openCartModal(): void {
    this.cartOpen.set(true);
  }

  closeCartModal(): void {
    this.cartOpen.set(false);
  }

  onAddToCart(product: Product): void {
    this.cartSvc.addProduct(product, this.idStore);
    this.closeProductModal();
    this.showToast(`✓ "${product.name}" agregado al carrito`);
    setTimeout(() => this.openCartModal(), 100);
  }

  onQuantityChanged(event: { id: string; delta: number }): void {
    this.cartSvc.updateQuantity(event.id, event.delta, this.idStore);
  }

  onRemoved(id: string): void {
    this.cartSvc.removeProduct(id, this.idStore);
  }

  onCleared(): void {
    this.cartSvc.clear(this.idStore);
  }

  onOrderPlaced(): void {
    this.subs.add(
      this.catalogSvc.placeOrder(this.idStore, this.cartSvc.items()).subscribe({
        next: (res) => {
          if (res.success) {
            this.cartSvc.clear(this.idStore);
            this.closeCartModal();
            this.errorMsg.set('¡Pedido realizado exitosamente!');
            this.products.set([]);
          }
        },
        error: () => this.showToast('Error al realizar el pedido.'),
      })
    );
  }

  // ─── Toast ────────────────────────────────────────────────────────────────
  showToast(msg: string): void {
    this.toastMsg.set(msg);
    this.toastActive.set(true);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastActive.set(false), 2500);
  }

  // ─── Keyboard ─────────────────────────────────────────────────────────────
  private onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.closeProductModal();
      this.closeCartModal();
    }
  };

  // ─── Helpers para template ────────────────────────────────────────────────
  get storeLogoSrc(): string { return this.store()?.image ?? ''; }
  get storeLogoVisible(): boolean { return !!(this.store()?.image); }
  get storeName(): string { return this.store()?.store ?? 'Catálogo'; }
  get cartCount(): number { return this.cartSvc.totalCount(); }
  get cartItems() { return this.cartSvc.items(); }
  get cartTotal(): number { return this.cartSvc.totalAmount(); }
}
