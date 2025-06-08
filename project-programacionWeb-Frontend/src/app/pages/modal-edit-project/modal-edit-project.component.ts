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
  selector: 'app-modal-edit-project',
  standalone: true,
  imports: [
    MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions,
    CommonModule, FormsModule, DialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, ReactiveFormsModule
  ],
  templateUrl: './modal-edit-project.component.html',
  styleUrls: ['./modal-edit-project.component.scss']
})
export class ModalEditProjectComponent implements OnInit {
  formEditProject!: FormGroup;
  availableAdministrators: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _projectService: ProjectService,
    private readonly _userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalEditProjectComponent>,
    private readonly _snackBar: MatSnackBar
  ) {
    this.createProjectForm();
  }

  ngOnInit(): void {
    this.getAllAdministrators();
    this.loadProjectData(); // ✅ Cargar datos del proyecto en el formulario
  }

  // Creación del formulario con validaciones
  private createProjectForm(): void {
    this.formEditProject = this._formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      administrador_id: ['', Validators.required]
    });
  }

  // Obtener la lista de administradores disponibles
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

  // Cargar datos existentes del proyecto
  private loadProjectData(): void {
    if (this.data.project) {
      this.formEditProject.patchValue({
        nombre: this.data.project.nombre,
        descripcion: this.data.project.descripcion,
        administrador_id: this.data.project.administrador_id
      });
    }
  }

  // Enviar el formulario para actualizar el proyecto
  onSubmit(): void {
    if (!this.formEditProject.valid) {
      // Si el formulario no es válido, muestra un mensaje de error y no continúa
      Swal.fire('Error', 'Completa todos los campos obligatorios', 'error');
      return;
    }

    // Prepara los datos actualizados del proyecto
    const updatedProjectData = {
      id: this.data.project.id, // asegura que se envíe el ID correcto
      nombre: this.formEditProject.get('nombre')?.value, // Nuevo nombre
      descripcion: this.formEditProject.get('descripcion')?.value, // Nueva descripción
      administrador_id: this.formEditProject.get('administrador_id')?.value // Nuevo administrador
    };

    // Muestra en consola los datos que se enviarán al backend
    console.log('Datos enviados al backend:', updatedProjectData);

    // Llama al servicio para actualizar el proyecto
    this._projectService.updateProject(this.data.project.id, updatedProjectData).subscribe({
      next: (response) => {
        // Si la actualización es exitosa, muestra mensaje y cierra el modal
        console.log('Proyecto actualizado con éxito:', response);
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.formEditProject.reset();
        this.dialogRef.close(true);
      },
      error: (error) => {
        // Si hay error, muestra mensaje de error
        console.error('Error al actualizar el proyecto:', error);
        const errorMessage = error.error?.message || 'Ocurrió un error inesperado. Intenta nuevamente.';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  // Cerrar el modal sin guardar cambios
  onCancel(): void {
    this.dialogRef.close();
  }
}
