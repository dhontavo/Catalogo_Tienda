import { Component, Input, OnInit, inject, input } from '@angular/core';
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
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, cashOutline, closeOutline, cubeOutline, documentTextOutline, informationCircleOutline } from 'ionicons/icons';

import { FileUploadService } from 'src/service/file-upload.service';
import { ProductService } from 'src/service/product.service';
import { AuthService } from 'src/service/auth.service';
import { ToolsService } from 'src/app/tools/tools';

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

  @Input() id_product: string = '';

  private fileUploadService = inject(FileUploadService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private tools = inject(ToolsService);

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
    if (this.id_product) {
      this.loadProduct();
    }
  }

  loadProduct() {
    this.productService.getProductById(this.id_product).subscribe({
      next: (res) => {
        if (res) {
          this.name = res.name;
          this.price = res.price ? parseFloat(Number(res.price).toFixed(2)) : null;
          this.description = res.description;
          this.previewImage = res.image;
        }
      },
      error: (err) => {
        this.tools.presentToast('Error al cargar datos del producto', 'danger');
        console.error(err);
      }
    });
  }

  limitDecimals(event: any) {
    const val = event.target.value;
    if (val && val.toString().includes('.')) {
      const parts = val.toString().split('.');
      if (parts[1].length > 2) {
        event.target.value = parts[0] + '.' + parts[1].slice(0, 2);
        this.price = parseFloat(event.target.value);
      }
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async selectImage() {
    const image = await this.fileUploadService.selectImage();
    if (image) {
      this.previewImage = image.webPath || image.dataUrl || '';
    }
  }

  /**
   * Convierte un Blob de imagen a una cadena Base64
   */
  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  async saveProduct() {
    if (!this.name || !this.price || !this.previewImage) {
      this.tools.presentToast('Falta agregar imagen o rellenar campos', 'warning');
      return;
    }

    try {
      const user = this.authService.getUser();
      const storeId = user ? user.id_store : null;
      const userId = user ? user.id : null;

      if (!storeId) {
        throw new Error('No se encontró información de la tienda');
      }

      if (!userId) {
        throw new Error('No se encontró información de usuario');
      }

      // Convertir la imagen a Base64 antes de enviarla
      let finalBase64Image = this.previewImage;
      if (this.previewImage && !this.previewImage.startsWith('data:')) {
        // Obtener el archivo desde la URI local
        const blob = await this.fileUploadService.getBlobFromUri(this.previewImage);
        // Convertirlo a Base64
        finalBase64Image = await this.convertBlobToBase64(blob);
      }

      const productData = {
        name: this.name,
        description: this.description,
        price: this.price,
        image: finalBase64Image,
        id_store: storeId,
        id_user: userId
      };

      if (this.id_product) {
        // Modo Edición
        this.productService.editProduct(this.id_product, productData).subscribe({
          next: (res) => {
            this.modalCtrl.dismiss(true);
          },
          error: (err) => {
            this.tools.presentToast('Error al editar el producto', 'danger');
          }
        });
      } else {
        // Modo Creación
        this.productService.addProduct(productData).subscribe({
          next: (res) => {
            this.modalCtrl.dismiss(true);
          },
          error: (err) => {
            this.tools.presentToast('Error al guardar el producto', 'danger');
          }
        });
      }
    } catch (error: any) {
      this.tools.dismissLoading();
      this.tools.presentToast(error.message || 'Error inesperado', 'danger');
    }
  }

}

