import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonFooter,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  logoWhatsapp,
  storefrontOutline,
  searchOutline,
  addOutline,
  removeOutline,
  trashOutline,
  closeOutline,
  bagCheckOutline,
  logInOutline,
  sparklesOutline,
  chevronForwardOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { SaasService, Store } from 'src/service/saas.service';
import { ToolsService } from 'src/app/tools/tools';
import { AuthService } from 'src/service/auth.service';

interface CartItem {
  product: any;
  quantity: number;
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonModal,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonFooter,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ]
})
export class CatalogPage implements OnInit {
  private saasService = inject(SaasService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tools = inject(ToolsService);

  stores: Store[] = [];
  selectedStore: Store | null = null;
  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';
  loading: boolean = false;

  // Carrito de compras
  cart: CartItem[] = [];
  isCartOpen: boolean = false;

  constructor() {
    addIcons({
      cartOutline,
      logoWhatsapp,
      storefrontOutline,
      searchOutline,
      addOutline,
      removeOutline,
      trashOutline,
      closeOutline,
      bagCheckOutline,
      logInOutline,
      sparklesOutline,
      chevronForwardOutline,
      arrowBackOutline
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const storeId = params.get('id_store');
      this.loadStores(storeId);
    });
  }

  loadStores(preselectedStoreId: string | null) {
    this.loading = true;
    this.saasService.getStores().subscribe({
      next: (stores) => {
        this.stores = stores;
        if (preselectedStoreId) {
          const found = stores.find(s => s.id === preselectedStoreId);
          if (found) {
            this.selectStore(found);
          } else {
            // Intentar cargar directamente la tienda
            this.saasService.getStore(preselectedStoreId).subscribe({
              next: (st) => {
                if (st) {
                  this.selectStore(st);
                } else if (stores.length > 0) {
                  this.selectStore(stores[0]);
                }
              }
            });
          }
        } else if (stores.length > 0) {
          this.selectStore(stores[0]);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onStoreChange(event: any) {
    const storeId = event.detail.value;
    const store = this.stores.find(s => s.id === storeId);
    if (store) {
      this.selectStore(store);
    }
  }

  selectStore(store: Store) {
    this.selectedStore = store;
    this.cart = [];
    this.loadProducts(store.id);
  }

  loadProducts(storeId: string) {
    this.loading = true;
    this.saasService.getStoreProducts(storeId).subscribe({
      next: (prods) => {
        this.products = prods;
        this.filterProducts();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterProducts() {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredProducts = this.products.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
  }

  addToCart(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.tools.presentToast(`"${product.name}" agregado al carrito`, 'success');
  }

  updateQuantity(item: CartItem, delta: number) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: CartItem) {
    this.cart = this.cart.filter(ci => ci.product.id !== item.product.id);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  openCart() {
    this.isCartOpen = true;
  }

  closeCart() {
    this.isCartOpen = false;
  }

  checkoutWhatsApp() {
    if (!this.selectedStore || this.cart.length === 0) return;

    const phone = this.selectedStore.phone ? this.selectedStore.phone.replace(/\D/g, '') : '';
    let message = `¡Hola *${this.selectedStore.name}*! 👋 Deseo realizar un pedido desde su catálogo digital:\n\n`;

    this.cart.forEach((item, idx) => {
      const subtotal = Number(item.product.price) * item.quantity;
      message += `${idx + 1}. *${item.product.name}* x${item.quantity} - $${subtotal.toFixed(2)}\n`;

      // Registrar pedido en el backend silenciosamente
      this.saasService.createOrder({
        id_product: item.product.id,
        id_store: this.selectedStore!.id,
        quantity: item.quantity,
        total_price: subtotal
      }).subscribe({ error: (e) => console.log('Order registered:', e) });
    });

    message += `\n*Total a Pagar:* $${this.cartTotal.toFixed(2)} MXN\n`;
    message += `\n¿Me confirma disponibilidad y forma de entrega? Muchas gracias.`;

    const encoded = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
    this.closeCart();
    this.cart = [];
    this.tools.presentToast('Pedido enviado a WhatsApp con éxito', 'success');
  }

  goToMerchantLogin() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/home');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}
