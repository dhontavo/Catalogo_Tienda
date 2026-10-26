import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonIcon,
  IonSearchbar,
  IonFab,
  IonFabButton,
  ModalController,
  IonTitle,
  ActionSheetController,
  IonProgressBar,
  IonButton,
  IonBadge
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  add,
  createOutline,
  eyeOutline,
  trashOutline,
  storefrontOutline,
  ribbonOutline,
  bagCheckOutline,
  arrowForwardOutline,
  sparklesOutline,
  cloudUploadOutline
} from 'ionicons/icons';
import { ProductService } from 'src/service/product.service';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { AddProductPage } from '../../modal/add-product/add-product.page';

import { MenuComponent } from '../../componet/menu/menu.component';
import { ToolsService } from 'src/app/tools/tools';
import { ViewProductComponent } from 'src/app/modal/view-product/view-product.component';
import { AuthService } from 'src/service/auth.service';
import { ChangePasswordModalComponent } from '../../modal/change-password/change-password.component';
import { FilterPipe } from '../../pipes/filter.pipe';
import { SaasService, Store, Plan } from 'src/service/saas.service';
import { PlanModalComponent } from 'src/app/modal/plan-modal/plan-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonSearchbar,
    IonFab,
    IonFabButton,
    FormsModule,
    NgFor,
    NgIf,
    MenuComponent,
    IonTitle,
    FilterPipe,
    DecimalPipe,
    IonProgressBar,
    IonButton,
    IonBadge
  ],
})
export class HomePage {
  private productService = inject(ProductService);
  private saasService = inject(SaasService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private actionSheetCtrl = inject(ActionSheetController);
  private tools = inject(ToolsService);
  private router = inject(Router);

  products: any[] = [];
  searchQuery: string = '';
  storeInfo: Store | null = null;
  currentPlan: Plan | null = null;
  maxProducts: number = 10;
  planName: string = 'Básico (Free)';

  constructor() {
    addIcons({
      add,
      eyeOutline,
      trashOutline,
      createOutline,
      storefrontOutline,
      ribbonOutline,
      bagCheckOutline,
      arrowForwardOutline,
      sparklesOutline,
      cloudUploadOutline
    });
  }

  ionViewWillEnter() {
    this.loadStoreAndPlan();
    this.loadProducts();
    this.checkTempPassword();
  }

  loadStoreAndPlan() {
    const user = this.authService.getUser();
    if (!user || !user.id_store) return;

    this.saasService.getStore(user.id_store).subscribe({
      next: (st) => {
        this.storeInfo = st;
        this.saasService.getPlans().subscribe({
          next: (plans) => {
            const planId = st && st.id_plan ? Number(st.id_plan) : 1;
            const p = plans.find(item => item.id === planId);
            if (p) {
              this.currentPlan = p;
              this.maxProducts = p.max_product;
              this.planName = p.name;
            }
          }
        });
      }
    });
  }

  get productUsagePercent(): number {
    if (!this.maxProducts || this.maxProducts <= 0) return 0;
    return Math.min(1, this.products.length / this.maxProducts);
  }

  get isLimitReached(): boolean {
    return this.products.length >= this.maxProducts;
  }

  checkTempPassword() {
    const user = this.authService.getUser();
    if (user && user.is_temp_pass) {
      setTimeout(() => {
        this.showChangePasswordModal();
      }, 500);
    }
  }

  async showChangePasswordModal() {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordModalComponent,
      backdropDismiss: false
    });
    return await modal.present();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res;
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.products = [];
      }
    });
  }

  viewPublicCatalog() {
    const user = this.authService.getUser();
    if (user && user.id_store) {
      this.router.navigate(['/catalog', user.id_store]);
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  goToOrders() {
    this.router.navigateByUrl('/orders');
  }

  async openPlansModal() {
    const modal = await this.modalCtrl.create({
      component: PlanModalComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.loadStoreAndPlan();
    }
  }

  async openUploadProduct() {
    if (this.isLimitReached) {
      this.tools.presentToast(`Has alcanzado el límite de ${this.maxProducts} productos de tu plan. Actualiza a Pro para subir más.`, 'warning');
      this.openPlansModal();
      return;
    }
    this.OpenModal2('', 'create');
  }

  async OpenModal2(item: any, option: string) {
    let component: any;
    let props: any;

    if (option === 'view') {
      component = ViewProductComponent;
      props = { product: item };
    } else {
      component = AddProductPage;
      props = { id_product: item };
    }

    const modal = await this.modalCtrl.create({
      component: component,
      componentProps: props
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.loadProducts();
    }
  }
}
