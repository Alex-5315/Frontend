/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogModule } from '@angular/cdk/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions,MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ProjectService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-modal-create-project',
  standalone: true,
  imports: [
    MatDialogModule, MatDialogTitle, MatDialogContent,MatDialogActions,
    CommonModule, FormsModule, DialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatDialogActions, MatSelectModule, ReactiveFormsModule
  ],
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.scss']
})
export class ModalCreateProjectComponent implements OnInit {
  formCreateProject!: FormGroup;
  availableAdministrators: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _projectService: ProjectService,
    private readonly _userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalCreateProjectComponent>,
    private readonly _snackBar: MatSnackBar
  ) {
    this.createProjectForm();
  }

  ngOnInit(): void {
    this.getAllAdministrators();
  }

  // Creación del formulario de proyectos con validaciones
  private createProjectForm(): void {
    this.formCreateProject = this._formBuilder.group({
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

  // Enviar el formulario para crear un nuevo proyecto
  onSubmit(): void {
    if (!this.formCreateProject.valid) {
      Swal.fire('Error', 'Completa todos los campos obligatorios', 'error');
      return;
    }

    const projectData = {
      nombre: this.formCreateProject.get('nombre')?.value,
      descripcion: this.formCreateProject.get('descripcion')?.value,
      administrador_id: this.formCreateProject.get('administrador_id')?.value
    };

    this._projectService.createProject(projectData).subscribe({
      next: (response) => {
        console.log('Proyecto creado con éxito:', response);
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.formCreateProject.reset();
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error en la creación del proyecto:', error);
        const errorMessage = error.error?.message || 'Ocurrió un error inesperado. Intenta nuevamente.';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  // Cerrar el modal de creación de proyectos
  onCancel(): void {
    this.dialogRef.close();
  }
}
