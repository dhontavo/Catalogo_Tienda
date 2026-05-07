import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonSearchbar,
  IonFab,
  IonFabButton,
  ModalController,
  IonTitle
} from '@ionic/angular/standalone';


import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { ProductService } from 'src/service/product.service';
import { NgFor, NgIf } from '@angular/common';
import { AddProductPage } from '../../modal/add-product/add-product.page';

import { MenuComponent } from '../../componet/menu/menu.component';
import { ToolsService } from 'src/app/tools/tools';


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
    IonTitle
  ],
})


export class HomePage implements OnInit {
  private productService = inject(ProductService);
  private modalCtrl = inject(ModalController);

  products: any[] = [];
  isModalOpen: boolean = false;
  private tools = inject(ToolsService);

  ngOnInit() {
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

  constructor() {
    addIcons({
      add,
    })
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: AddProductPage,
      // componentProps: { value: 123 } // Opcional: pasar datos
    });
    return await modal.present();
  }
}




