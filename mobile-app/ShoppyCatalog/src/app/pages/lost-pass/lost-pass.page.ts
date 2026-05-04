import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonImg, 
  IonInput, 
  IonIcon, 
  IonButton 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-lost-pass',
  templateUrl: './lost-pass.page.html',
  styleUrls: ['./lost-pass.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
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

  constructor() {
    addIcons({ mailOutline });
  }

  ngOnInit() {
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

