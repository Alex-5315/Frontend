/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalEditProjectComponent } from '../modal-edit-project/modal-edit-project.component'; 
import { ProjectService } from 'app/services/projects/projects.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalCreateProjectComponent } from '../modal-create-project/modal-create-project.component';
import { ModalViewProjectComponent } from '../modal-view-project/modal-view-project.component';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatProgressSpinner,
    CommonModule,
    BreadcrumbComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  isAdmin = false;

  displayedColumns: string[] = ['nombre', 'descripcion', 'administrador', 'action'];
  breadscrums = [{ title: 'Gestión de proyectos', item: [], active: 'Lista de proyectos' }];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  projectFormSearchFilter!: FormGroup;
  projectsList: any[] = [];
  isLoading = false;
  projectDefaultFilterSearch: any = { nombre: undefined };

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly projectService: ProjectService,
    private readonly dialogModel: MatDialog,
    private readonly _snackBar: MatSnackBar,
    private readonly router: Router // Agregado para la navegación
  ) { }
  
  ngOnInit(): void {
    this.createProjectFormSearchFilter();
    this.getAllProjects();
    this.handleProjectFilterChange('nombre', 'nombre');
  }

  private createProjectFormSearchFilter() {
    this.projectFormSearchFilter = this._formBuilder.group({ nombre: [''] });
  }


  handleProjectFilterChange(controlName: string, filterKey: string) {
    this.projectFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.projectDefaultFilterSearch[filterKey] = value;
      this.getAllProjects();
    });
  }

  getAllProjects(): void {
    this.isLoading = true;
    this.projectService.getAllProjects().subscribe({
      next: (response: { projects: any[] }) => {
            this.projectsList = response.projects.map(project => ({
                ...project,
                fecha_creacion: project.fecha_creacion, //  Fecha
                cantidadUsuarios: project.usuarios ? project.usuarios.length : 0 // Contador de usuarios asignados
            }));
            this.dataSource.data = this.projectsList;
            this.dataSource.paginator = this.paginator;
            this.isLoading = false;
        },
        error: (error) => {
            console.error('Error al obtener proyectos:', error);
            this.isLoading = false;
        }
    });
}

  openModalCreateProject(): void {
    const dialogRef = this.dialogModel.open(ModalCreateProjectComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getAllProjects();
    });
  }

openModalEditProject(project: any): void {
    const dialogRef = this.dialogModel.open(ModalEditProjectComponent, {
        width: '600px',
        data: { project } //  Enviamos los datos del proyecto
    });

    dialogRef.afterClosed().subscribe((result) => {
        if (result) {
            this.getAllProjects(); //  Actualizamos los proyectos después de editar
        }
    });
}


  openModalViewProject(project: any): void {
    this.router.navigate(['/projects', project.id]);
    const dialogRef = this.dialogModel.open(ModalViewProjectComponent, {
        data: project,
        minWidth: '300px',
        maxWidth: '1000px',
        width: '820px',
        disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.getAllProjects(); // En caso de que se actualice algo dentro del modal
        }
    });
}


  deleteProject(projectId: number): void {
    this.projectService.deleteProject(projectId.toString()).subscribe({
      next: (response) => {
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.getAllProjects();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el proyecto';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }
}
