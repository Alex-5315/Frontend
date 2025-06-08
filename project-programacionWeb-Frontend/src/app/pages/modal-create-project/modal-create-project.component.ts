/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogModule } from '@angular/cdk/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ProjectService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-modal-create-project',
  standalone: true,
  imports: [
    MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions,
    CommonModule, FormsModule, DialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatDialogActions, MatSelectModule, ReactiveFormsModule
  ],
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.scss']
})
export class ModalCreateProjectComponent implements OnInit {
  // Formulario reactivo para crear el proyecto
  formCreateProject!: FormGroup;
  // Lista de administradores disponibles para asignar al proyecto
  availableAdministrators: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Datos inyectados al modal (si los hay)
    private readonly _formBuilder: FormBuilder, // Para construir el formulario reactivo
    private readonly _projectService: ProjectService, // Servicio para proyectos
    private readonly _userService: UsersService, // Servicio para usuarios
    private readonly dialogRef: MatDialogRef<ModalCreateProjectComponent>, // Referencia al modal para cerrarlo
    private readonly _snackBar: MatSnackBar // Para mostrar mensajes tipo snackbar
  ) {
    this.createProjectForm(); // Inicializa el formulario al crear el componente
  }

  ngOnInit(): void {
    this.getAllAdministrators(); // Carga la lista de administradores al iniciar el modal
  }

  // Crea el formulario de proyectos con validaciones requeridas
  private createProjectForm(): void {
    this.formCreateProject = this._formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      administrador_id: ['', Validators.required]
    });
  }

  // Obtiene la lista de administradores disponibles para asignar al proyecto
  getAllAdministrators(): void {
    this._userService.getAllAdministrator().subscribe({
      next: (res) => {
        this.availableAdministrators = res.users;
      },
      error: (err) => {
        console.error('Error al obtener administradores:', err);
      }
    });
  }

  // Envía el formulario para crear un nuevo proyecto
  onSubmit(): void {
    if (!this.formCreateProject.valid) {
      Swal.fire('Error', 'Completa todos los campos obligatorios', 'error');
      return;
    }

    // Prepara los datos del proyecto a crear
    const projectData = {
      nombre: this.formCreateProject.get('nombre')?.value,
      descripcion: this.formCreateProject.get('descripcion')?.value,
      administrador_id: this.formCreateProject.get('administrador_id')?.value
    };

    // Llama al servicio para crear el proyecto
    this._projectService.createProject(projectData).subscribe({
      next: (response) => {
        console.log('Proyecto creado con éxito:', response);
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.formCreateProject.reset();
        this.dialogRef.close(true); // Cierra el modal y notifica éxito
      },
      error: (error) => {
        console.error('Error en la creación del proyecto:', error);
        const errorMessage = error.error?.message || 'Ocurrió un error inesperado. Intenta nuevamente.';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  // Cierra el modal de creación de proyectos sin guardar cambios
  onCancel(): void {
    this.dialogRef.close();
  }
}
