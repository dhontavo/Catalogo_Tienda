import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonIcon,
  IonButtons,
  IonButton,
  ModalController,
  IonNote,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, cashOutline, closeOutline, cubeOutline, documentTextOutline, informationCircleOutline } from 'ionicons/icons';

import { FileUploadService } from 'src/service/file-upload.service';
import { ProductService } from 'src/service/product.service';
import { AuthService } from 'src/service/auth.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonIcon,
    IonButtons,
    IonButton,
    IonNote
  ]
})
export class AddProductPage implements OnInit {

  // Propiedades para el formulario
  name: string = '';
  price: number | null = null;
  description: string = '';
  previewImage: string = '';

  private fileUploadService = inject(FileUploadService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      cloudUploadOutline,
      cashOutline,
      closeOutline,
      cubeOutline,
      documentTextOutline,
      informationCircleOutline
    });
  }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async selectImage() {
    const image = await this.fileUploadService.selectImage();
    if (image) {
      this.previewImage = image.webPath || '';
    }
  }

  async saveProduct() {
    if (!this.name || !this.price || !this.previewImage) {
      this.showToast('Por favor, completa todos los campos obligatorios', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Guardando producto...'
    });
    await loading.present();

    try {
      const user = this.authService.getUser();
      const storeId = user ? user.id_store : null;

      if (!storeId) {
        throw new Error('No se encontró información de la tienda');
      }

      const productData = {
        name: this.name,
        description: this.description,
        price: this.price,
        image_url: this.previewImage, // En una app real, aquí subirías el archivo primero
        store_id: storeId
      };

      this.productService.addProduct(productData).subscribe({
        next: (res) => {
          loading.dismiss();
          this.showToast('Producto guardado con éxito', 'success');
          this.modalCtrl.dismiss(true);
        },
        error: (err) => {
          loading.dismiss();
          this.showToast('Error al guardar el producto', 'danger');
          console.error(err);
        }
      });
    } catch (error: any) {
      loading.dismiss();
      this.showToast(error.message || 'Error inesperado', 'danger');
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
