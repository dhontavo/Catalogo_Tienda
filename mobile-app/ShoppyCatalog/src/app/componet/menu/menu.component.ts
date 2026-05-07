import { Component, Input, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonMenuButton,
  IonButtons
} from '@ionic/angular/standalone';
import { ThemeService } from 'src/service/theme.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
    IonMenuButton,
    IonButtons
  ],
})
export class MenuComponent {
  @Input() title: string = '';
  public themeService = inject(ThemeService);
}

