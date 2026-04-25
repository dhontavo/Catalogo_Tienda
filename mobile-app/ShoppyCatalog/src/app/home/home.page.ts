import { Component, inject, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { ProductService } from 'src/service/product.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon
  ],
})
export class HomePage implements OnInit {
  private productService = inject(ProductService);
  products: any[] = [];

  ngOnInit() {
    this.productService.getProducts().subscribe(res => {
      this.products = res;
    });
  }

  cconstructor() {
    addIcons({
      add,

    })
  }

}
