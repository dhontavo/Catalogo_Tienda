import { Component, inject, OnInit } from '@angular/core';
import { 
  IonButton, 
  IonFooter, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonIcon, 
  IonContent,
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  documentTextOutline, 
  banOutline, 
  alertCircleOutline, 
  flameOutline, 
  handLeftOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonFooter,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonContent
  ],
})
export class TermsConditionsComponent implements OnInit {
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({
      closeOutline,
      documentTextOutline,
      banOutline,
      alertCircleOutline,
      flameOutline,
      handLeftOutline
    });
  }

  dismiss() {
    this.modalCtrl.dismiss(false);
  }

  accept() {
    this.modalCtrl.dismiss(true);
  }

  ngOnInit() { }
}

