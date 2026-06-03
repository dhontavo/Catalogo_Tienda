import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonList,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { AuthService } from 'src/service/auth.service';
import { ToolsService } from 'src/app/tools/tools';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonList
  ]
})
export class ChangePasswordModalComponent implements OnInit {
  private authService = inject(AuthService);
  private tools = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  newPassword = '';
  confirmPassword = '';

  constructor() {
    addIcons({ lockClosedOutline, checkmarkCircleOutline });
  }

  ngOnInit() { }

  hasUpper(p: string) { return /[A-Z]/.test(p) && /[a-z]/.test(p); }
  hasNumber(p: string) { return /[0-9]/.test(p) && /[!@#$%^&*]/.test(p); }

  isFormValid() {
    return this.newPassword.length >= 8 &&
      this.newPassword === this.confirmPassword &&
      this.hasUpper(this.newPassword) &&
      this.hasNumber(this.newPassword);
  }

  updatePassword() {
    const user = this.authService.getUser();
    this.authService.changePassword(user.id, this.newPassword).subscribe({
      next: (res) => {
        this.tools.presentToast('¡Contraseña actualizada! Ahora puedes usar tu nueva clave.', 'success');
        // Actualizar el flag local para que no vuelva a aparecer
        user.is_temp_pass = false;
        localStorage.setItem('user', JSON.stringify(user));
        this.modalCtrl.dismiss(true);
      },
      error: (err) => {
        this.tools.presentToast('Error al actualizar la contraseña.', 'danger');
      }
    });
  }
}
