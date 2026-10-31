import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/catalog.service';

const FALLBACK = 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() index = 0;
  @Output() verMas = new EventEmitter<Product>();

  get imageSrc(): string {
    return this.product.image?.trim() ? this.product.image : FALLBACK;
  }

  get delayStyle(): string {
    return `animation-delay: ${this.index * 0.05}s`;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK;
  }

  onVerMas(): void {
    this.verMas.emit(this.product);
  }

  formatMXN(amount: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }
}
