import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonFooter
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { ToolsService } from 'src/app/tools/tools';
import { ProductService } from 'src/service/product.service';
import { AddProductPage } from '../add-product/add-product.page';
@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter
  ]
})
export class ViewProductComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private tools = inject(ToolsService);
  private productService = inject(ProductService);

  @Input() product: any = {};

  constructor() {
    addIcons({ closeOutline, createOutline, trashOutline });
  }

  ngOnInit() { }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async editProduct() {
    const modal = await this.modalCtrl.create({
      component: AddProductPage,
      componentProps: { id_product: this.product.id }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // Si se editó con éxito, cerramos este modal para que el home se refresque
      this.modalCtrl.dismiss(true);
    }

    this.closeModal();
  }

  async deleteProduct() {

    if (await this.tools.presentAlertConfirm('Eliminar producto', '¿Está seguro de que desea eliminar este producto')) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: (res) => {
          this.closeModal();
          console.log('Eliminar producto.')
        },
        error: (err) => {
          console.error(err);
        }
      });
    }

  }


}
