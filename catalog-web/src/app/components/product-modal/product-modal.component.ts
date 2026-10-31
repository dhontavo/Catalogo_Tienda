import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/catalog.service';

const FALLBACK = 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-modal.component.html',
})
export class ProductModalComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Product>();

  visible = false;

  ngOnChanges(): void {
    if (this.product) {
      // pequeño delay para que la transición CSS funcione
      requestAnimationFrame(() => (this.visible = true));
    } else {
      this.visible = false;
    }
  }

  get imageSrc(): string {
    return this.product?.image?.trim() ? this.product.image : FALLBACK;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK;
  }

  onClose(): void {
    this.visible = false;
    setTimeout(() => this.close.emit(), 300);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }

  onAddToCart(): void {
    if (this.product) this.addToCart.emit(this.product);
  }

  formatMXN(amount: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }
}
