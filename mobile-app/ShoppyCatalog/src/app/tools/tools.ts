import { Injectable } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }


  /**
   * Muestra un mensaje toast en la parte inferior de la pantalla.
   * @param message Mensaje a mostrar
   * @param color Color del toast (primary, success, danger, warning, etc.)
   * @param duration Duración en milisegundos
   */
  async presentToast(message: string, color: string = 'primary', duration: number = 2000) {
    const toast = await this.toastController.create({
      message: message,
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
    return await this.loadingController.dismiss();
  }

  /**
   * Muestra una alerta de confirmación con botones Sí y No.
   * @param header Título de la alerta
   * @param message Mensaje de la alerta
   * @returns Promesa que resuelve a true si el usuario presiona "Sí", o false si presiona "No"
   */
  async presentAlertConfirm(header: string = '', message: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Sí',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }
}


