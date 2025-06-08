import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon'; 
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';
import { ModalAssignUsersComponent } from '../modal-assign-users/modal-assign-users.component';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-modal-view-project',
  standalone: true,
  imports: [

    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    BreadcrumbComponent
  ],
  templateUrl: './modal-view-project.component.html',
  styleUrls: ['./modal-view-project.component.scss']
})
export class ModalViewProjectComponent implements OnInit {
  userRole: number = 0;

  
  breadscrums = [
    {
      title: 'Gestión de proyectos',
      item: ['Lista de proyectos'],
      active: 'Datos básicos'
    }
  ];

  breadscrumsDetails = [
    { 
      title: '',
    },
  ];

  projectId: number | null = null; // Inicializa projectId como null
  project: any = {}; // Inicializa project como un objeto vacío
  usersList = new MatTableDataSource<any>([]);
  adminName: string = '';
  displayedColumns: string[] = ['nombre', 'email', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    // Obtiene el parámetro 'id' de la ruta (id del proyecto)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectId = Number(id);
      // Llama al servicio para obtener todos los proyectos
      this.projectService.getAllProjects().subscribe({
        next: (projects) => {
          console.log('Respuesta de getAllProjects:', projects);
          // Busca el proyecto específico por id
          const foundProject = projects.projects.find((p: any) => p.id === this.projectId);
          if (foundProject) {
            this.project = foundProject; // Asigna el proyecto encontrado
            this.usersList.data = foundProject.usuarios || []; // Asigna los usuarios asociados al proyecto
          } else {
            this.usersList.data = []; // Si no encuentra el proyecto, deja la lista vacía
          }
        },
        error: (err) => {
          this.usersList.data = []; // Si hay error, deja la lista vacía
        }
      });
    }

    // Obtiene la información del usuario logueado y su rol
    const userInfo = this.authService.getAuthFromSessionStorage();
    this.userRole = userInfo.rol_id;

    // Asigna el paginador a la tabla de usuarios después de cargar los datos
    setTimeout(() => {
      this.usersList.paginator = this.paginator;
    });
  }

  openAssignUsersModal(): void {
    this.dialog.open(ModalAssignUsersComponent, {
        width: '1000px',
        data: { projectId: this.project.id }
    }).afterClosed().subscribe((result) => {
        if (result) {
          // Refresca usando getAllProjects
          this.projectService.getAllProjects().subscribe({
            next: (projects) => {
              const foundProject = projects.projects.find((p: any) => p.id === this.projectId);
              if (foundProject) {
                this.project = foundProject;
                this.usersList.data = foundProject.usuarios || [];
              } else {
                this.usersList.data = [];
              }
              this.cdr.detectChanges();
            }
          });
        }
    });
  }


  assingUsersToProject(): void {
  // Lógica para asociar usuarios al proyecto
  }

  removeUserFromProject(userId: number): void {
  if (this.projectId !== null) {
    this.projectService.removeUserFromProject(this.projectId, userId).subscribe({
      next: () => {
        // Refresca usando getAllProjects
        this.projectService.getAllProjects().subscribe({
          next: (projects) => {
            const foundProject = projects.projects.find((p: any) => p.id === this.projectId);
            if (foundProject) {
              this.project = foundProject;
              this.usersList.data = foundProject.usuarios || [];
            } else {
              this.usersList.data = [];
            }
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al desasociar usuario:', err);
      }
    });
  }
 }

 volver(): void {
  this.location.back();
}
}