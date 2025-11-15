import { Injectable } from '@angular/core';
import { ToastController, ToastOptions } from '@ionic/angular/standalone';

/**
 * Wrapper for Ionic's ToastController to standardize toast messages.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private readonly toastController: ToastController) {}

  /**
   * Presents a standardized success toast.
   * @param message The message to display.
   * @param duration The duration in ms.
   */
  public async presentSuccess(
    message: string,
    duration: number = 2000
  ): Promise<void> {
    await this.presentToast({
      message,
      duration,
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
  }

  /**
   * Presents a standardized error toast.
   * @param message The message to display.
   * @param duration The duration in ms.
   */
  public async presentError(
    message: string,
    duration: number = 3000
  ): Promise<void> {
    await this.presentToast({
      message,
      duration,
      color: 'danger',
      icon: 'alert-circle-outline',
    });
  }

  /**
   * Presents a standardized info/warning toast.
   * @param message The message to display.
   * @param duration The duration in ms.
   */
  public async presentInfo(
    message: string,
    duration: number = 2000
  ): Promise<void> {
    await this.presentToast({
      message,
      duration,
      color: 'warning',
      icon: 'information-circle-outline',
    });
  }

  /**
   * Private generic toast presentation method.
   * @param options The Ionic ToastOptions.
   */
  private async presentToast(options: ToastOptions): Promise<void> {
    const toast = await this.toastController.create({
      ...options,
      position: 'top',
    });
    await toast.present();
  }
}
