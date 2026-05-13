import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonSearchbar,
  IonFab,
  IonFabButton,
  ModalController,
  IonTitle,
  ActionSheetController
} from '@ionic/angular/standalone';


import { addIcons } from 'ionicons';
import { add, createOutline, eyeOutline, trashOutline } from 'ionicons/icons';
import { ProductService } from 'src/service/product.service';
import { NgFor, NgIf } from '@angular/common';
import { AddProductPage } from '../../modal/add-product/add-product.page';

import { MenuComponent } from '../../componet/menu/menu.component';
import { ToolsService } from 'src/app/tools/tools';
import { async } from 'rxjs';
import { ViewProductComponent } from 'src/app/modal/view-product/view-product.component';
import { FilterPipe } from '../../pipes/filter.pipe';


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
    FilterPipe
  ],
})


export class HomePage implements OnInit {
  private productService = inject(ProductService);
  private modalCtrl = inject(ModalController);
  private actionSheetCtrl = inject(ActionSheetController);

  products: any[] = [];
  searchQuery: string = '';
  isModalOpen: boolean = false;
  private tools = inject(ToolsService);

  ngOnInit() {
    this.loadProducts();
  }

  constructor() {
    addIcons({
      add,
      eyeOutline,
      trashOutline,
      createOutline
    })
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res;

      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.products = []; // Vaciar para mostrar el mensaje de error
      }
    });
  }

  async openModal(product?: any, option: any = AddProductPage) {
    const props = option === ViewProductComponent
      ? { product: product }
      : { id_product: product?.id };

    const modal = await this.modalCtrl.create({
      component: option,
      componentProps: props
    });
    this.loadProducts();
    return await modal.present();
  }

  async OpenModal2(item: any, option: string) {
    let component: any;
    let props: any;

    if (option === 'view') {
      component = ViewProductComponent;
      props = { product: item };
    } else {
      component = AddProductPage;
      // Si es crear, item es vacío. Si es editar, item sería el ID.
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

  async accions(product: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar opción',
      buttons: [
        {
          text: 'Ver',
          icon: 'eye-outline',
          handler: async () => {
            this.openModal(product, ViewProductComponent);
          }
        },
        {
          text: 'Editar',
          icon: 'create-outline',
          handler: async () => {
            this.openModal(product);
          }
        },
        {
          text: 'Eliminar',
          icon: 'trash-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
    await actionSheet.onDidDismiss();
  }
}




