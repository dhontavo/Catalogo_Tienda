import { Component } from '@angular/core';
import { ThemeService } from 'src/service/theme.service';
import { IonHeader, IonToolbar, IonContent, IonMenu, IonItem, IonLabel, IonToggle, IonIcon, IonList, IonTitle, IonMenuButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

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

  constructor(public themeService: ThemeService) {
    addIcons({ moonOutline, sunnyOutline });
  }

  toggleTheme(event: any) {
    this.themeService.toggleTheme(event.detail.checked);
  }
}
