import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CatalogService, Product, OrderItem, Plan } from '../../services/catalog.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly authSvc = inject(AuthService);
  private catalogSvc = inject(CatalogService);
  private router = inject(Router);

  // Tab activo
  activeTab = signal<'overview' | 'products' | 'orders' | 'store' | 'plan'>('overview');

  // Estado de datos
  products = signal<Product[]>([]);
  orders = signal<OrderItem[]>([]);
  plans = signal<Plan[]>([]);
  loadingProducts = signal(true);
  loadingOrders = signal(true);

  // Filtro de búsqueda
  searchQuery = signal('');
  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  });

  // Modal de Producto (Crear / Editar)
  productModalOpen = signal(false);
  isEditingProduct = signal(false);
  modalProductId = signal<string | number | null>(null);
  productForm = {
    name: '',
    description: '',
    price: 0,
    image: '',
  };
  productImagePreview = signal('');
  savingProduct = signal(false);

  // Configuración de Tienda
  storeForm = {
    store: '',
    dialing_code: '+57',
    cellphone: '',
    image: '',
    colors: '#6366f1',
  };
  savingStore = signal(false);
  colorOptions = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#10b981', '#06b6d4',
    '#0284c7', '#1e293b'
  ];

  // Toast
  toastMsg = signal('');
  toastActive = signal(false);
  private toastTimer?: ReturnType<typeof setTimeout>;

  // Información del Plan
  currentPlan = computed(() => {
    const planId = this.authSvc.userPlanId();
    return this.plans().find((p) => p.id === planId) || {
      id: 1,
      plan: 'Gratuito',
      max_product: 10,
      advertisement: 'SI',
      price: 0,
    };
  });

  planProgress = computed(() => {
    const plan = this.currentPlan();
    const count = this.products().length;
    if (!plan.max_product) return { percent: 0, isUnlimited: true, count, max: null };
    const pct = Math.min(100, Math.round((count / plan.max_product) * 100));
    return {
      percent: pct,
      isUnlimited: false,
      count,
      max: plan.max_product,
      isFull: count >= plan.max_product,
    };
  });

  ngOnInit(): void {
    if (!this.authSvc.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.initStoreForm();
    this.loadPlans();
    this.loadProducts();
    this.loadOrders();
  }

  private initStoreForm(): void {
    const user = this.authSvc.currentUser();
    if (user) {
      this.storeForm.store = user.store || '';
      this.storeForm.dialing_code = user.dialing_code || '+52';
      this.storeForm.cellphone = user.cellphone || '';
      this.storeForm.image = user.store_image || 'favicon.png';
      this.storeForm.colors = user.colors?.split(',')[0]?.trim() || '#10b981';
    }
  }

  loadPlans(): void {
    this.catalogSvc.getPlans().subscribe({
      next: (res) => {
        if (res?.data) this.plans.set(res.data);
      },
    });
  }

  loadProducts(): void {
    const storeId = this.authSvc.storeId();
    if (!storeId) return;

    this.loadingProducts.set(true);
    this.catalogSvc.getProducts(storeId).subscribe({
      next: (res) => {
        if (res?.data) this.products.set(res.data);
        this.loadingProducts.set(false);
      },
      error: () => this.loadingProducts.set(false),
    });
  }

  loadOrders(): void {
    const storeId = this.authSvc.storeId();
    if (!storeId) return;

    this.loadingOrders.set(true);
    this.catalogSvc.getStoreOrders(storeId).subscribe({
      next: (res) => {
        if (res?.data) this.orders.set(res.data);
        this.loadingOrders.set(false);
      },
      error: () => this.loadingOrders.set(false),
    });
  }

  // ─── Modal de Productos ──────────────────────────────────────────────────
  openNewProductModal(): void {
    if (this.planProgress().isFull) {
      this.showToast('⚠️ Has alcanzado el límite de productos de tu plan. Mejora tu plan para agregar más.');
      this.activeTab.set('plan');
      return;
    }

    this.isEditingProduct.set(false);
    this.modalProductId.set(null);
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      image: '',
    };
    this.productImagePreview.set('');
    this.productModalOpen.set(true);
  }

  openEditProductModal(p: Product): void {
    this.isEditingProduct.set(true);
    this.modalProductId.set(p.id);
    this.productForm = {
      name: p.name,
      description: p.description || '',
      price: p.price,
      image: p.image || '',
    };
    this.productImagePreview.set(p.image || '');
    this.productModalOpen.set(true);
  }

  closeProductModal(): void {
    this.productModalOpen.set(false);
  }

  onProductImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.productForm.image = base64;
        this.productImagePreview.set(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct(): void {
    if (!this.productForm.name.trim()) {
      this.showToast('Por favor ingresa el nombre del producto.');
      return;
    }

    if (this.productForm.price < 0) {
      this.showToast('El precio no puede ser negativo.');
      return;
    }

    this.savingProduct.set(true);
    const storeId = this.authSvc.storeId();
    const userId = this.authSvc.currentUser()?.id || '';

    if (this.isEditingProduct()) {
      const id = this.modalProductId()!;
      this.catalogSvc.updateProduct(id, this.productForm).subscribe({
        next: () => {
          this.savingProduct.set(false);
          this.closeProductModal();
          this.showToast('✅ Producto actualizado correctamente.');
          this.loadProducts();
        },
        error: (err) => {
          this.savingProduct.set(false);
          const msg = err.error?.error || 'Error al actualizar el producto.';
          this.showToast('❌ ' + msg);
        },
      });
    } else {
      if (!this.productForm.image) {
        this.savingProduct.set(false);
        this.showToast('Por favor selecciona una imagen para el producto.');
        return;
      }

      this.catalogSvc
        .createProduct({
          id_store: storeId,
          id_user: userId,
          name: this.productForm.name.trim(),
          description: this.productForm.description.trim(),
          price: Number(this.productForm.price),
          image: this.productForm.image,
        })
        .subscribe({
          next: () => {
            this.savingProduct.set(false);
            this.closeProductModal();
            this.showToast('✅ Producto creado con éxito.');
            this.loadProducts();
          },
          error: (err) => {
            this.savingProduct.set(false);
            const msg = err.error?.error || 'Error al crear el producto.';
            this.showToast('❌ ' + msg);
          },
        });
    }
  }

  deleteProduct(id: string | number): void {
    if (!confirm('¿Estás seguro de eliminar este producto de tu catálogo?')) return;

    this.catalogSvc.deleteProduct(id).subscribe({
      next: () => {
        this.showToast('🗑️ Producto eliminado.');
        this.loadProducts();
      },
      error: () => this.showToast('❌ Error al eliminar el producto.'),
    });
  }

  // ─── Guardar Tienda ──────────────────────────────────────────────────────
  saveStoreSettings(): void {
    this.savingStore.set(true);
    const storeId = this.authSvc.storeId();

    this.catalogSvc
      .updateStore({
        id_store: storeId,
        id: storeId,
        store: this.storeForm.store.trim(),
        dialing_code: this.storeForm.dialing_code,
        cellphone: this.storeForm.cellphone.trim(),
        colors: this.storeForm.colors,
        image: this.storeForm.image || undefined,
      })
      .subscribe({
        next: (res) => {
          this.savingStore.set(false);
          this.showToast('✅ Configuración de la tienda guardada.');
          // Actualizar estado del usuario en AuthService
          this.authSvc.updateProfile({
            store: this.storeForm.store.trim(),
            cellphone: this.storeForm.cellphone.trim(),
            dialing_code: this.storeForm.dialing_code,
            colors: this.storeForm.colors,
          }).subscribe();
        },
        error: (err) => {
          this.savingStore.set(false);
          this.showToast('❌ Error al guardar tienda: ' + (err.error?.error || err.message));
        },
      });
  }

  onStoreLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.storeForm.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ─── Cambiar / Upgrade Plan ──────────────────────────────────────────────
  changePlan(planId: number): void {
    if (planId === this.authSvc.userPlanId()) return;

    this.authSvc.updateProfile({ id_plan: planId }).subscribe({
      next: () => {
        this.showToast('🎉 ¡Plan actualizado con éxito!');
      },
      error: () => this.showToast('❌ Error al actualizar el plan.'),
    });
  }

  // ─── Compartir Enlace ───────────────────────────────────────────────────
  getStoreCatalogUrl(): string {
    const storeId = this.authSvc.storeId();
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/store/${storeId}`;
    }
    return `/store/${storeId}`;
  }

  copyCatalogLink(): void {
    const url = this.getStoreCatalogUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('📋 ¡Enlace copiado al portapapeles!');
      });
    } else {
      this.showToast('Enlace: ' + url);
    }
  }

  // ─── Toast Feedback ─────────────────────────────────────────────────────
  showToast(msg: string): void {
    this.toastMsg.set(msg);
    this.toastActive.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastActive.set(false);
    }, 3500);
  }

  logout(): void {
    this.authSvc.logout();
  }
}
