import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonThumbnail,
  IonSpinner,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bagCheckOutline,
  timeOutline,
  cashOutline,
  cubeOutline,
  storefrontOutline,
  receiptOutline
} from 'ionicons/icons';
import { SaasService, OrderItem } from 'src/service/saas.service';
import { AuthService } from 'src/service/auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    DatePipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonThumbnail,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ]
})
export class OrdersPage implements OnInit {
  private saasService = inject(SaasService);
  private authService = inject(AuthService);

  orders: OrderItem[] = [];
  loading: boolean = false;

  constructor() {
    addIcons({
      bagCheckOutline,
      timeOutline,
      cashOutline,
      cubeOutline,
      storefrontOutline,
      receiptOutline
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(event?: any) {
    const user = this.authService.getUser();
    if (!user || !user.id_store) {
      if (event) event.target.complete();
      return;
    }

    this.loading = !event;
    this.saasService.getStoreOrders(user.id_store).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  get totalSales(): number {
    return this.orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  }
}
