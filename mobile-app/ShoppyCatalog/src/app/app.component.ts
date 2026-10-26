import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonListHeader,
  IonBadge,
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
  sunnyOutline,
  storefrontOutline,
  cartOutline,
  cloudUploadOutline,
  bagCheckOutline,
  logInOutline,
  personAddOutline,
  sparklesOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule,
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
    IonListHeader,
    IonBadge
  ],
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  public auth = inject(AuthService);
  private tools = inject(ToolsService);
  private menuCtrl = inject(MenuController);

  constructor(public themeService: ThemeService) {
    addIcons({ 
      homeOutline, 
      logOutOutline, 
      personOutline, 
      barChartOutline, 
      moonOutline, 
      sunnyOutline,
      storefrontOutline,
      cartOutline,
      cloudUploadOutline,
      bagCheckOutline,
      logInOutline,
      personAddOutline,
      sparklesOutline
    });
  }

  ngOnInit() {
    this.themeService.initializeTheme();
  }

  get user() {
    return this.auth.getUser();
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
    this.menuCtrl.close('main-menu');
  }

  async logOut() {
    if (await this.tools.presentAlertConfirm('Cerrar sesión', '¿Deseas salir del modo comerciante?')) {
      this.auth.logout();
      this.menuCtrl.close('main-menu');
      window.location.href = '/catalog';
    }
  }

  toggleTheme(event: any) {
    this.themeService.toggleTheme(event.detail.checked);
  }
}
