import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, cashOutline, closeOutline } from 'ionicons/icons';

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
    IonButton
  ]
})
export class AddProductPage {

  previewImage: string = '';

  constructor(private modalCtrl: ModalController) {
    addIcons({
      cloudUploadOutline,
      cashOutline,
      closeOutline
    });
  }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }


  async saveProduct() {

  }

  selectImage() {

  }
}
