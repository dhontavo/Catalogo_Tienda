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
  ribbonOutline,
  callOutline,
  chevronDownOutline
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

  countries = [
    { name: 'México', code: '+52', flag: '🇲🇽' },
    { name: 'USA', code: '+1', flag: '🇺🇸' },
    { name: 'España', code: '+34', flag: '🇪🇸' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Perú', code: '+51', flag: '🇵🇪' },
    { name: 'Ecuador', code: '+593', flag: '🇪🇨' }
  ];

  form = {
    name: '',
    lastname: '',
    birthday: '',
    email: '',
    username: '',
    password: '',
    store: '',
    id_plan: 1,
    dialing_code: '+52',
    cellphone: ''
  };

  constructor() {
    addIcons({
      atOutline,
      calendarOutline,
      lockClosedOutline,
      storefrontOutline,
      mailOutline,
      personOutline,
      ribbonOutline,
      callOutline,
      chevronDownOutline
    });
  }

  formatPhone(event: any) {
    let val = event.target.value.replace(/\D/g, ''); // Solo números
    if (val.length > 10) val = val.substring(0, 10); // Máximo 10 dígitos

    const parts = [];
    if (val.length > 0) parts.push('(' + val.substring(0, 3));
    if (val.length > 3) parts[0] = parts[0] + ') ' + val.substring(3, 6);
    if (val.length > 6) parts[0] = parts[0] + '-' + val.substring(6, 10);

    this.form.cellphone = parts[0] || '';
    event.target.value = this.form.cellphone;
  }


  async register() {
    // Validar campos básicos
    if (!this.form.username || !this.form.password || !this.form.email || !this.form.store) {
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
