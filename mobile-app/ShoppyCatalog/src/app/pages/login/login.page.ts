import { Component, inject } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { lockClosedOutline, personOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ToolsService } from 'src/app/tools/tools';

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
  private tools = inject(ToolsService);

  form = {
    username: '',
    password: ''
  };
  showPassword: boolean = false;

  constructor() {
    addIcons({
      personOutline,
      lockClosedOutline,
      eyeOffOutline,
      eyeOutline
    })
  }

  async login() {
    this.auth.login(this.form).subscribe({
      next: async (res) => {
        this.router.navigateByUrl('/home');
      },
      error: async () => {
        this.tools.presentToast('Credenciales incorrectas', 'danger', 2000)
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  routerPath(path: string) {
    this.router.navigateByUrl(path);
  }
}