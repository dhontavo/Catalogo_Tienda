import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonCol,
  IonDatetimeButton,
  IonDatetime,
  IonModal,
  IonButtons,
  IonImg
} from '@ionic/angular/standalone';


import {
  atOutline,
  calendarOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  storefrontOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.page.html',
  styleUrls: ['./new-account.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonRow,
    IonCol,
    IonDatetimeButton,
    IonDatetime,
    IonModal,
    IonButtons,
    IonImg
  ]
})
export class NewAccountPage {

  constructor() {
    addIcons({
      atOutline,
      calendarOutline,
      lockClosedOutline,
      storefrontOutline,
      mailOutline,
      personOutline
    })

  }
}
