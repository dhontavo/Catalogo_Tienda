import { Component, inject } from '@angular/core';
import { ThemeService } from 'src/service/theme.service';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonMenu,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonList,
  IonTitle,
  IonMenuButton,
  IonButtons,
  IonSplitPane
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { homeOutline, logOutOutline, moonOutline, personOutline, sunnyOutline } from 'ionicons/icons';
import { AuthService } from 'src/service/auth.service';
import { Router } from '@angular/router';
import { ToolsService } from 'src/app/tools/tools';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonMenu,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
    IonList,
    IonTitle,
    IonMenuButton,
    IonButtons,
    IonSplitPane
  ],
})


export class MenuComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private tools = inject(ToolsService);


  constructor(public themeService: ThemeService) {
    addIcons({
      moonOutline,
      sunnyOutline,
      logOutOutline,
      personOutline,
      homeOutline
    });
  }

  async logOut() {
    if (await this.tools.presentAlertConfirm('Cerrar sesión', '¿Está seguro de que desea cerrar sesión?')) {
      const loading = await this.tools.presentLoading('Cerrando sesión...');

      // Pequeño delay para mejorar la UX
      setTimeout(() => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
        loading.dismiss();
      }, 1000);
    }
  }


  person() {
    this.router.navigateByUrl('/profile')
  }

  home() {
    this.router.navigateByUrl('/home')
  }

  toggleTheme(event: any) {
    this.themeService.toggleTheme(event.detail.checked);
  }
}
