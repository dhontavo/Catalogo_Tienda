import { Injectable, inject } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);

  constructor() { }


  /**
   * Muestra un mensaje toast en la parte inferior de la pantalla.
   * @param message Mensaje a mostrar
   * @param color Color del toast (primary, success, danger, warning, etc.)
   * @param duration Duración en milisegundos
   */
  async presentToast(message: any, color: string = 'primary', duration: number = 2000) {
    // Asegurar que el mensaje sea un string para evitar errores con .trim()
    let msgStr = '';
    if (typeof message === 'string') {
      msgStr = message;
    } else if (message && typeof message === 'object') {
      msgStr = JSON.stringify(message);
    } else {
      msgStr = String(message || '');
    }

    if (!msgStr || msgStr.trim() === '') {
      console.warn('ToolsService: Intento de mostrar un toast vacío detectado.');
      msgStr = 'Ocurrió un evento inesperado (Sin mensaje).';
    }



    const toast = await this.toastController.create({
      message: msgStr,
      duration: duration,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Muestra un indicador de carga personalizado con el icono de la app.
   * @param message Mensaje opcional para mostrar debajo del icono
   * @returns El elemento loading para poder cerrarlo después
   */
  async presentLoading(message: string = 'Cargando...') {
    const loading = await this.loadingController.create({
      message: message,
      spinner: null,
      cssClass: 'custom-loading-class',
      translucent: true,
      backdropDismiss: false
    });
    await loading.present();
    return loading;
  }


  /**
   * Cierra el indicador de carga que esté activo.
   */
  async dismissLoading() {
    try {
      const top = await this.loadingController.getTop();
      if (top) {
        return await this.loadingController.dismiss();
      }
      return false;
    } catch (e) {
      console.warn('ToolsService: Error al cerrar loading:', e);
      return false;
    }
  }

  /**
   * Muestra una alerta de confirmación con botones Sí y No.
   * @param header Título de la alerta
   * @param message Mensaje de la alerta
   * @returns Promesa que resuelve a true si el usuario presiona "Sí", o false si presiona "No"
   */
  async presentAlertConfirm(header: string = '', message: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí',
          role: 'confirm'
        }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  /**
   * Muestra una alerta de confirmación con botones Sí y No.
   * @param alertHeader Título de la alerta
   * @param alertSubtitle Mensaje de la alerta
   * @param message Mensaje de la alerta
   * @returns Promesa que resuelve a true si el usuario presiona "Sí", o false si presiona "No"
   */
  async presentAlert(alertHeader: string = 'Error', alertSubtitle: string = '', message: string = '') {
    const alert = await this.alertController.create({
      header: alertHeader,
      subHeader: alertSubtitle,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * Valida si un correo electrónico tiene un formato correcto.
   * @param email Correo electrónico a validar
   * @returns true si es válido, false en caso contrario
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}


