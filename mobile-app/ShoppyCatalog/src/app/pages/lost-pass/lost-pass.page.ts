import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-lost-pass',
  templateUrl: './lost-pass.page.html',
  styleUrls: ['./lost-pass.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LostPassPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
