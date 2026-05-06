import { Component, inject } from '@angular/core';
import { ThemeService } from 'src/service/theme.service';
import { IonHeader, IonToolbar, IonContent, IonMenu, IonItem, IonLabel, IonToggle, IonIcon, IonList, IonTitle, IonMenuButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, moonOutline, personOutline, sunnyOutline } from 'ionicons/icons';
import { AuthService } from 'src/service/auth.service';
import { Router } from '@angular/router';

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
    IonButtons
  ],
})
export class MenuComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor(public themeService: ThemeService) {
    addIcons({ moonOutline, sunnyOutline, logOutOutline, personOutline });
  }

  logOut() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  toggleTheme(event: any) {
    this.themeService.toggleTheme(event.detail.checked);
  }
}
