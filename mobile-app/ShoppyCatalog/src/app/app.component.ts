import { Component, OnInit, inject } from '@angular/core';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonContent, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel,
  IonToggle,
  MenuController
} from '@ionic/angular/standalone';
import { ThemeService } from 'src/service/theme.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/service/auth.service';
import { ToolsService } from 'src/app/tools/tools';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  logOutOutline, 
  personOutline, 
  barChartOutline, 
  moonOutline, 
  sunnyOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp, 
    IonRouterOutlet, 
    IonMenu, 
    IonHeader, 
    IonToolbar, 
    IonContent, 
    IonList, 
    IonItem, 
    IonIcon, 
    IonLabel,
    IonToggle
  ],
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private tools = inject(ToolsService);
  private menuCtrl = inject(MenuController);

  constructor(public themeService: ThemeService) {
    addIcons({ 
      homeOutline, 
      logOutOutline, 
      personOutline, 
      barChartOutline, 
      moonOutline, 
      sunnyOutline 
    });
  }

  ngOnInit() {
    this.themeService.initializeTheme();
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
    this.menuCtrl.close('main-menu');
  }

  async logOut() {
    if (await this.tools.presentAlertConfirm('Cerrar sesión', '¿Está seguro?')) {
      this.auth.logout();
      this.menuCtrl.close('main-menu');
      // Forzamos la recarga de la app en /login para limpiar cualquier vista cacheada por Ionic
      window.location.href = '/login';
    }
  }

  toggleTheme(event: any) {
    this.themeService.toggleTheme(event.detail.checked);
  }
}




