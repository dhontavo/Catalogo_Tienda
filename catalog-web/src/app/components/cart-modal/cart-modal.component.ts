import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CartService } from '../../services/cart.service';

const FALLBACK = 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-modal.component.html',
})
export class CartModalComponent implements OnChanges {
  @Input() open = false;
  @Input() idStore = '';
  @Input() items: CartItem[] = [];
  @Input() totalAmount = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() orderPlaced = new EventEmitter<void>();
  @Output() quantityChanged = new EventEmitter<{ id: string; delta: number }>();
  @Output() removed = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  visible = false;

  ngOnChanges(): void {
    if (this.open) {
      requestAnimationFrame(() => (this.visible = true));
    } else {
      this.visible = false;
    }
  }

  onClose(): void {
    this.visible = false;
    setTimeout(() => this.closeModal.emit(), 300);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }

  imgSrc(item: CartItem): string {
    return item.image?.trim() ? item.image : FALLBACK;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK;
  }

  increase(id: string): void {
    this.quantityChanged.emit({ id, delta: 1 });
  }

  decrease(id: string): void {
    this.quantityChanged.emit({ id, delta: -1 });
  }

  remove(id: string): void {
    this.removed.emit(id);
  }

  clearAll(): void {
    this.cleared.emit();
  }

  placeOrder(): void {
    this.orderPlaced.emit();
  }

  formatMXN(amount: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }
}
