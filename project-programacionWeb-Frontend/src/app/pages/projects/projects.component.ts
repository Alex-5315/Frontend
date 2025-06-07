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
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'app/services/auth.service';


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
  userRole: number = 0;

  displayedColumns: string[] = ['nombre', 'descripcion', 'administrador', 'action'];
  breadscrums = [{ title: 'Gestión de proyectos', item: [], active: 'Lista de proyectos' }];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  projectFormSearchFilter!: FormGroup;
  projectsList: any[] = [];
  isLoading = false;
  projectDefaultFilterSearch: any = { nombre: undefined };

  pageSize = 6;
  pageIndex = 0;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly projectService: ProjectService,
    private readonly dialogModel: MatDialog,
    private readonly _snackBar: MatSnackBar,
    private readonly router: Router, // Agregado para la navegación
    private readonly authService: AuthService,
  ) { }
  
  ngOnInit(): void {
    const userInfo = this.authService.getAuthFromSessionStorage();
    this.userRole = userInfo.rol_id;
    this.isLoading = true;
    this.createProjectFormSearchFilter();

    // Ahora todos usan getAllProjects, el backend filtra según el usuario
    this.getAllProjects();
  }

  getProjectsByUserId(userId: number): void {
    this.isLoading = true;
    this.projectService.getAllProjects().subscribe({
      next: (response: { projects: any[] }) => {
        const filteredProjects = response.projects.filter(project =>
          project.usuarios?.some((u: any) => u.id === userId)
        );
        this.projectsList = filteredProjects.map(project => ({
          ...project,
          fecha_creacion: project.fecha_creacion,
          cantidadUsuarios: project.usuarios ? project.usuarios.length : 0
        }));
        this.dataSource.data = this.projectsList;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener proyectos por usuario:', error);
        this.isLoading = false;
      }
    });
  }

  private createProjectFormSearchFilter() {
    this.projectFormSearchFilter = this._formBuilder.group({
      nombre: [''],
      descripcion: [''],
      fecha: ['']
    });

    this.projectFormSearchFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.applyProjectFilter();
      });
  }

  applyProjectFilter() {
    const { nombre, descripcion, fecha } = this.projectFormSearchFilter.value;
    let filtered = this.projectsList;

    if (nombre) {
      filtered = filtered.filter(project =>
        project.nombre?.toLowerCase().includes(nombre.toLowerCase())
      );
    }
    if (descripcion) {
      filtered = filtered.filter(project =>
        project.descripcion?.toLowerCase().includes(descripcion.toLowerCase())
      );
    }
    if (fecha) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.fecha_creacion);
        const formatted = projectDate.toLocaleDateString('es-ES');
        return formatted.includes(fecha);
      });
    }

    this.dataSource.data = filtered;
    this.pageIndex = 0; // Reinicia la paginación al buscar
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
        const user = this.authService.getAuthFromSessionStorage();
        let filteredProjects = response.projects;

        // Si el usuario NO es admin, filtra solo los proyectos donde participa
        if (user.rol_id !== 1) { // Asumiendo 1 = admin
          filteredProjects = response.projects.filter(project =>
            project.usuarios?.some((u: any) => u.id === user.id)
          );
        }

        this.projectsList = filteredProjects.map(project => ({
          ...project,
          fecha_creacion: project.fecha_creacion,
          cantidadUsuarios: project.usuarios ? project.usuarios.length : 0
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

openDetailProject(project: any): void {
    this.router.navigate(['/page/projects/detail', project.id]);
}

  openModalViewProject(project: any): void {
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

  get pagedProjects() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.dataSource.data.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
