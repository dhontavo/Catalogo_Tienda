import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonCol,
  IonDatetimeButton,
  IonDatetime,
  IonModal,
  IonButtons,
  IonImg,
  ToastController,
  IonLabel,
  ModalController,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/service/auth.service';

import {
  atOutline,
  calendarOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  storefrontOutline,
  ribbonOutline
} from 'ionicons/icons';

import { addIcons } from 'ionicons';
import { TermsConditionsComponent } from 'src/app/modal/terms-conditions/terms-conditions.component';

@Component({

  selector: 'app-new-account',
  templateUrl: './new-account.page.html',
  styleUrls: ['./new-account.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonRow,
    IonCol,
    IonDatetimeButton,
    IonDatetime,
    IonModal,
    IonButtons,
    IonImg,
    IonLabel,
    TermsConditionsComponent,
    IonSelect,
    IonSelectOption
  ]
})
export class NewAccountPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController)

  form = {
    name: '',
    lastname: '',
    birthday: '',
    email: '',
    username: '',
    password: '',
    id_store: '',
    id_plan: 1
  };

  constructor() {
    addIcons({
      atOutline,
      calendarOutline,
      lockClosedOutline,
      storefrontOutline,
      mailOutline,
      personOutline,
      ribbonOutline
    });
  }


  async register() {
    // Validar campos básicos
    if (!this.form.username || !this.form.password || !this.form.email) {
      this.showToast('Por favor rellena los campos obligatorios.', 'warning');
      return;
    }

    this.authService.register(this.form).subscribe({
      next: (res: any) => {
        this.showToast('Cuenta creada con éxito. Ya puedes iniciar sesión.', 'success');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Error al crear la cuenta.';
        this.showToast(errorMsg, 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  onDateChange(event: any) {
    this.form.birthday = event.detail.value.split('T')[0];
  }

  async terms() {
    const modal = await this.modalCtrl.create({
      component: TermsConditionsComponent,
    });
    return await modal.present();
  }

}
