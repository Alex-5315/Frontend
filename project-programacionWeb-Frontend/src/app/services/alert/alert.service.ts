// Importación de módulos necesarios para la funcionalidad de notificaciones
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

// Decorador que indica que este servicio estará disponible en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class AlertService {

  // Constructor del servicio que inyecta el componente `MatSnackBar` para mostrar notificaciones
  constructor(private _snackBar: MatSnackBar) { }

  /**
   * Método para mostrar una notificación en la interfaz de usuario
   * @param colorName - Nombre de la clase CSS que se aplicará al mensaje
   * @param text - Texto que se mostrará en la notificación
   * @param placementFrom - Posición vertical de la notificación (`bottom` por defecto)
   * @param placementAlign - Posición horizontal de la notificación (`center` por defecto)
   */
  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition = 'bottom',
    placementAlign: MatSnackBarHorizontalPosition = 'center'
  ) {
    this._snackBar.open(text, '', {
      duration: 5000, // Duración de la notificación en pantalla (5 segundos)
      verticalPosition: placementFrom, // Posición vertical (bottom, top)
      horizontalPosition: placementAlign, // Posición horizontal (start, center, end, left, right)
      panelClass: colorName, // Aplicación de una clase de estilos personalizada
    });
  }
}

