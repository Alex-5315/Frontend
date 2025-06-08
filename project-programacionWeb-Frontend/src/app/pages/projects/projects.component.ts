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
    // Obtiene los valores actuales del formulario de búsqueda
    const { nombre, descripcion, fecha } = this.projectFormSearchFilter.value;
    let filtered = this.projectsList;

    // Filtra por nombre si hay valor
    if (nombre) {
      filtered = filtered.filter(project =>
        project.nombre?.toLowerCase().includes(nombre.toLowerCase())
      );
    }
    // Filtra por descripción si hay valor
    if (descripcion) {
      filtered = filtered.filter(project =>
        project.descripcion?.toLowerCase().includes(descripcion.toLowerCase())
      );
    }
    // Filtra por fecha si hay valor (busca coincidencia en la fecha formateada)
    if (fecha) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.fecha_creacion);
        const formatted = projectDate.toLocaleDateString('es-ES');
        return formatted.includes(fecha);
      });
    }

    // Actualiza la dataSource de la tabla con los proyectos filtrados
    this.dataSource.data = filtered;
    this.pageIndex = 0; // Reinicia la paginación al buscar
  }

  // (No es necesario usar este método si filtras solo en frontend)
  handleProjectFilterChange(controlName: string, filterKey: string) {
    // Escucha cambios en un campo específico y vuelve a cargar los proyectos desde el backend
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
    // Llama al servicio para obtener todos los proyectos
    this.projectService.getAllProjects().subscribe({
      next: (response: { projects: any[] }) => {
        const user = this.authService.getAuthFromSessionStorage();
        let filteredProjects = response.projects;

        // Si el usuario NO es admin, filtra solo los proyectos donde participa
        if (user.rol_id !== 1) {
          filteredProjects = response.projects.filter(project =>
            project.usuarios?.some((u: any) => u.id === user.id)
          );
        }

        // Mapea los proyectos para agregar cantidad de usuarios y formatear la fecha
        this.projectsList = filteredProjects.map(project => ({
          ...project,
          fecha_creacion: project.fecha_creacion,
          cantidadUsuarios: project.usuarios ? project.usuarios.length : 0
        }));
        // Actualiza la tabla y el paginador
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

// Abre el modal para crear un nuevo proyecto
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

// Abre el modal para editar un proyecto existente
openModalEditProject(project: any): void {
  const dialogRef = this.dialogModel.open(ModalEditProjectComponent, {
      width: '600px',
      data: { project }
  });

  dialogRef.afterClosed().subscribe((result) => {
      if (result) {
          this.getAllProjects();
      }
  });
}

// Navega a la vista de detalle del proyecto
openDetailProject(project: any): void {
  this.router.navigate(['/page/projects/detail', project.id]);
}

// Abre el modal para ver detalles del proyecto
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
          this.getAllProjects();
      }
  });
}

// Elimina un proyecto y muestra un mensaje
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

// Getter para obtener los proyectos paginados según el índice y tamaño de página
get pagedProjects() {
  const start = this.pageIndex * this.pageSize;
  const end = start + this.pageSize;
  return this.dataSource.data.slice(start, end);
}

// Maneja el cambio de página del paginador
onPageChange(event: PageEvent) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}
}
