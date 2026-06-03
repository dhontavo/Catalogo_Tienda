import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonImg,
  IonInput,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';
import { AuthService } from 'src/service/auth.service';
import { ToolsService } from 'src/app/tools/tools';

@Component({
  selector: 'app-lost-pass',
  templateUrl: './lost-pass.page.html',
  styleUrls: ['./lost-pass.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonImg,
    IonInput,
    IonIcon,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class LostPassPage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private tools = inject(ToolsService);
  email: string = '';

  constructor() {
    addIcons({ mailOutline });
  }

  ngOnInit() {
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  sendResetLink() {
    if (this.email === '') {
      this.tools.presentToast('Ingrese su correo electrónico', 'danger');
      return;
    }

    if (!this.tools.validateEmail(this.email)) {
      this.tools.presentToast('Ingrese un correo electrónico válido', 'danger');
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.tools.presentToast(res.message, 'success');
        this.email = '';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.tools.presentToast(err.error?.message || 'Error al enviar correo', 'danger');
      }
    });
  }
}
