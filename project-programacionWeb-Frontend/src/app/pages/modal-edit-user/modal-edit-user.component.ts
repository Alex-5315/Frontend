/* eslint-disable @typescript-eslint/no-explicit-any */ 
// Deshabilitar la regla eslint para permitir el uso de `any` en el código

// Importación de módulos esenciales para la gestión del formulario y la interfaz gráfica
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from 'app/services/users/users.service';

// Definición del componente modal para editar usuarios
@Component({
  selector: 'app-modal-edit-user',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatDialogActions, MatDialogClose, 
    MatDialogTitle, MatDialogContent, ReactiveFormsModule
  ],
  templateUrl: './modal-edit-user.component.html',
  styleUrl: './modal-edit-user.component.scss'
})
export class ModalEditUserComponent implements OnInit {

  // Definición del formulario reactivo para actualizar usuarios
  formUpdateUsers!: FormGroup;

  // Lista de administradores disponibles para asignación
  administratorsValues: any[] = [];

  // URL base de los servicios (en caso de ser necesario)
  urlBaseServices: any;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe datos desde el modal de diálogo
    private readonly _formBuilder: FormBuilder, // Servicio para manejar formularios
    private readonly _snackBar: MatSnackBar, // Servicio para mostrar mensajes emergentes
    private readonly _userService: UsersService, // Servicio para gestionar usuarios
    private readonly dialogRef: MatDialogRef<ModalEditUserComponent>, // Referencia al modal de edición
  ) {
    this.updateFormUsers(); // Inicializa el formulario de edición
    console.log('Formulario inicializado:', this.formUpdateUsers.value);
    this.getAllAdministrators(); // Obtiene la lista de administradores disponibles
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    console.log('Datos recibidos en el modal de edición:', this.data);

    // Verificar que los datos recibidos contengan el identificador del administrador
    if (this.data && typeof this.data.administrador_id !== 'undefined') { 
        this.loadUserData(this.data); // Cargar datos en el formulario
        console.log('Datos cargados en el formulario:', this.formUpdateUsers.value);
    } else {
        console.error('Error: `administrador_id` no está en los datos del modal.');
    }
  }

  // Creación del formulario reactivo con validaciones
  updateFormUsers() {
    this.formUpdateUsers = this._formBuilder.group({
      nombre: ['', Validators.required], // Campo obligatorio
      email: ['', [Validators.required, Validators.email]], // Campo obligatorio con validación de correo
      rol_id: ['', Validators.required], // Campo obligatorio
      administrador_id: ['', Validators.required] // Asegurar que siempre tenga valor
    });
  }

  // Método para cargar los datos del usuario en el formulario
  loadUserData(user: any) {
    if (!user.administrador_id) {
        console.error('Error: `administrador_id` no está definido en el usuario.');
        return;
    }

    // Carga los datos del usuario en el formulario
    this.formUpdateUsers.patchValue({
      nombre: user.nombre,
      email: user.email,
      rol_id: String(user.rol_id), // Convertir `rol_id` a cadena para evitar errores en el `mat-select`
      administrador_id: user.administrador_id
    });
  }

  // Obtiene la lista de administradores para selección en el formulario
  getAllAdministrators() {
    this._userService.getAllAdministrator().subscribe({
      next: (res) => {
        this.administratorsValues = res.users; // Almacena los administradores obtenidos
      },
      error: (err) => {
        console.error('Error al obtener administradores:', err);
      }
    });
  }

  // Método para actualizar los datos de un usuario
  updateUsers() {
    if (this.formUpdateUsers.valid) {
      const userData = { ...this.formUpdateUsers.value }; // Extraer valores del formulario

      // Verificar que el `administrador_id` no esté vacío antes de enviar
      if (!userData.administrador_id) {
        console.error('Error: `administrador_id` está vacío antes de enviar.');
        return;
      }

      const userId = this.data?.id; // Obtener el ID del usuario a actualizar
      console.log('Datos enviados:', userData);

      // Verificar si el usuario tiene un ID válido antes de enviar la actualización
      if (!userId) {
        console.error('Error: ID de usuario no definido');
        this._snackBar.open('Error: No se pudo obtener el ID del usuario', 'Cerrar', { duration: 5000 });
        return;
      }

      // Solicitud al servicio para actualizar el usuario en la base de datos
      this._userService.updateUser(userId, userData).subscribe({
          next: (response) => {
              this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
              this.formUpdateUsers.reset(); // Limpia el formulario tras actualización exitosa
              this.dialogRef.close(true); // Cierra el modal
          },
          error: (error) => {
              console.error('Error al actualizar usuario:', error); // Registro de error
              console.log('Detalles del error recibido:', JSON.stringify(error, null, 2)); // Ver detalles en JSON

              this._snackBar.open(error.error?.message || 'Ocurrió un error inesperado.', 'Cerrar', { duration: 5000 });
          }
      });
    }
  }
}

