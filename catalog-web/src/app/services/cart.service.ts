import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from './catalog.service';

export interface CartItem {
  id_product: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /** Estado reactivo del carrito */
  private _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly totalCount = computed(() =>
    this._items().reduce((s, p) => s + p.quantity, 0)
  );

  readonly totalAmount = computed(() =>
    this._items().reduce((s, p) => s + p.price * p.quantity, 0)
  );

  // ─── Storage ──────────────────────────────────────────────────────────────

  private storageKey(idStore: string): string {
    return `cart_${idStore}`;
  }

  load(idStore: string): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(this.storageKey(idStore));
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw).map((p: CartItem) => ({
          ...p,
          id_product: String(p.id_product),
        }));
        this._items.set(parsed);
      }
    } catch {
      this._items.set([]);
    }
  }

  private save(idStore: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.storageKey(idStore), JSON.stringify(this._items()));
  }

  // ─── Cart Operations ──────────────────────────────────────────────────────

  addProduct(product: Product, idStore: string): void {
    const id = String(product.id ?? product.id_product);
    this._items.update(items => {
      const idx = items.findIndex(p => p.id_product === id);
      if (idx !== -1) {
        const updated = [...items];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...items, {
        id_product: id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      }];
    });
    this.save(idStore);
  }

  removeProduct(id: string, idStore: string): void {
    this._items.update(items => items.filter(p => p.id_product !== id));
    this.save(idStore);
  }

  updateQuantity(id: string, delta: number, idStore: string): void {
    this._items.update(items => {
      const updated = items.map(p =>
        p.id_product === id ? { ...p, quantity: p.quantity + delta } : p
      ).filter(p => p.quantity > 0);
      return updated;
    });
    this.save(idStore);
  }

  clear(idStore: string): void {
    this._items.set([]);
    this.save(idStore);
  }
}
