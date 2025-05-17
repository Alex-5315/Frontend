/* eslint-disable @typescript-eslint/no-explicit-any */
// Importar módulos y componentes necesarios para la gestión de usuarios en Angular
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalEditUserComponent } from '../modal-edit-user/modal-edit-user.component'; 
import { UsersService } from 'app/services/users/users.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalCreateUserComponent } from '../modal-create-user/modal-create-user.component';

// Definición de la interfaz para la estructura de un usuario
export interface User {
  name: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatProgressSpinner,
    CommonModule,
    BreadcrumbComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {

  // Configuración de columnas de la tabla de usuarios
  displayedColumns: string[] = [
    'name',
    'email',
    'role',
    'action'
  ];

  // Configuración de rutas y navegación en la interfaz de usuario
  breadscrums = [
    {
      title: 'Gestión de usuarios',
      item: [],
      active: 'Datos básicos',
    },
  ];

  // Tabla y paginación de datos
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  // Definición del formulario de búsqueda de usuarios
  userFormSearchFilter!: FormGroup;
  usersList: any[] = [];

  // Estado de carga para mostrar spinner mientras se obtienen los datos
  isLoading = false;

  // Valores predeterminados del filtro de búsqueda
  userDefaultFilterSearch: any = {
    name: undefined,
    email: undefined,
  };

  constructor(
    private readonly _formBuilder: FormBuilder, // Servicio para manejar formularios
    private readonly userService: UsersService, // Servicio que gestiona los usuarios
    private readonly dialogModel: MatDialog, // Servicio para abrir modales
    private readonly _sanckBar: MatSnackBar // Servicio para mostrar notificaciones
  ) { }
  
  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.createUserFormSearchFilter(); // Configuración del formulario de búsqueda
    this.getAllUserByAdministrator(); // Obtener lista de usuarios
    this.handleUserFilterChance('name', 'name'); // Manejo de cambios en el filtro de nombre
    this.handleUserFilterChance('email', 'email'); // Manejo de cambios en el filtro de email
  }

  // Creación de formulario reactivo para búsqueda de usuarios con validaciones
  private createUserFormSearchFilter() {
    this.userFormSearchFilter = this._formBuilder.group({
      name: [''], // Campo de búsqueda por nombre
      email: [''] // Campo de búsqueda por email
    });
  }

  // Conversión de roles numéricos a nombres más comprensibles
  getRoleName(rol_id: number): string {
    switch (rol_id){
      case 1:
        return 'Administrador';
      case 2:
        return 'Usuario';
      default:
        return 'Desconocido';
    }
  }

  // Manejo de cambios en el formulario de búsqueda con debounce para evitar solicitudes excesivas
  handleUserFilterChance(controlName: string, filterKey: string) {
    this.userFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500), // Espera 500ms antes de ejecutar la búsqueda
      distinctUntilChanged() // Solo realiza la búsqueda si el valor cambió
    ).subscribe((value: any) => {
      this.userDefaultFilterSearch[filterKey] = value;
      console.log(this.userDefaultFilterSearch);
      this.getAllUserByAdministrator({ ...this.userDefaultFilterSearch, [filterKey]: value });
    });
  }

  // Obtención de lista de usuarios administrados con filtrado opcional
  getAllUserByAdministrator(filters?: any): void {
    this.isLoading = true; // Activa indicador de carga
    this.userService.getAllUserByAdministrator(filters).subscribe({
      next: (response: { users: any[] }) => {
        this.usersList = response.users;
        console.log('listado', this.usersList);
        this.dataSource.data = response.users;
        this.dataSource.paginator = this.paginator; // Configura paginador
        this.isLoading = false; // Oculta indicador de carga
      }
    });
  }

  // Método para abrir el modal de creación de usuario
  openModalCreateUser(): void {
    const dialogRef = this.dialogModel.open(ModalCreateUserComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true, // Evita cerrar el modal sin acción
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUserByAdministrator(); // Actualiza la lista tras la creación de usuario
      }
    });
  }

  // Método para abrir el modal de edición de usuario, enviando su información
  openModalUpdateUsers(userInformation: any): void {
    console.log('Usuario seleccionado para edición:', userInformation);
    console.log('ID del usuario:', userInformation.id);
    console.log('Admin ID del usuario:', userInformation.administrador_id); // Depuración

    const dialogRef = this.dialogModel.open(ModalEditUserComponent, {
        data: userInformation // Envía datos del usuario al modal
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.getAllUserByAdministrator(); // Actualiza lista tras edición
        }
    });
  }

  // Método para eliminar un usuario
  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        this._sanckBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.getAllUserByAdministrator(); // Actualiza lista tras eliminación
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el usuario';
        this._sanckBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }
}
