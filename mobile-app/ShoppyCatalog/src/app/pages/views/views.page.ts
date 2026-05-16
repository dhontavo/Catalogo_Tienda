import { Component, ViewChild, ElementRef, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { MenuComponent } from '../../componet/menu/menu.component';
import { ProductService } from 'src/service/product.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-views',
  templateUrl: './views.page.html',
  styleUrls: ['./views.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CommonModule,
    FormsModule,
    MenuComponent
  ]
})
export class ViewsPage implements AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef;

  private productService = inject(ProductService);
  bars: any;
  colorArray: any;

  products: any[] = [];

  constructor() { }

  ionViewWillEnter() {
    this.productService.getProducts().subscribe(res => {
      this.products = res;
      if (this.products.length > 0) {
        this.createBarChart();
      }
    });
  }

  ngAfterViewInit() {
  }

  createBarChart() {
    if (this.bars) {
      this.bars.destroy();
    }

    // Mocking views if not present in the API
    const labels = this.products.map(p => p.name);
    const data = this.products.map(p => p.views || Math.floor(Math.random() * 100));

    this.bars = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Visualizaciones por Producto',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}

