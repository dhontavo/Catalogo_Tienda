import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkCircleOutline, rocketOutline, starOutline } from 'ionicons/icons';
import { SaasService, Plan } from 'src/service/saas.service';
import { ToolsService } from 'src/app/tools/tools';

@Component({
  selector: 'app-plan-modal',
  templateUrl: './plan-modal.component.html',
  styleUrls: ['./plan-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge
  ]
})
export class PlanModalComponent implements OnInit {
  private saasService = inject(SaasService);
  private modalCtrl = inject(ModalController);
  private tools = inject(ToolsService);

  plans: Plan[] = [];
  currentPlanId: number = 1;

  constructor() {
    addIcons({
      closeOutline,
      checkmarkCircleOutline,
      rocketOutline,
      starOutline
    });
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.saasService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
      },
      error: () => {
        this.plans = [
          { id: 1, name: 'Básico (Free)', price: 0, max_product: 10, status: 1 },
          { id: 2, name: 'Emprendedor (Pro)', price: 9.99, max_product: 100, status: 1 },
          { id: 3, name: 'Empresarial', price: 29.99, max_product: 1000, status: 1 }
        ];
      }
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  selectPlan(plan: Plan) {
    this.tools.presentToast(`Has seleccionado el plan ${plan.name}. Contacta al soporte para activar tu suscripción.`, 'success');
    this.modalCtrl.dismiss(plan);
  }
}
