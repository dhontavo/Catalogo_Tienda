import { Component, inject } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { add, lockClosedOutline, personOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule
  ]
})
export class LoginPage {

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastController);

  form = {
    username: '',
    password: ''
  };

  constructor() {
    addIcons({
      personOutline,
      lockClosedOutline

    })
  }

  async login() {
    this.auth.login(this.form).subscribe({
      next: async (res) => {
        this.router.navigateByUrl('/home');
      },
      error: async () => {
        const t = await this.toast.create({
          message: 'Credenciales incorrectas',
          duration: 2000,
          color: 'danger'
        });
        t.present();
      }
    });
  }
}