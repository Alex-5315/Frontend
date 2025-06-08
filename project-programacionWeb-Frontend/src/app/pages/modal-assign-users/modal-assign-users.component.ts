import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { User } from 'app/pages/users/users.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-modal-assign-users',
  templateUrl: './modal-assign-users.component.html',
  styleUrls: ['./modal-assign-users.component.scss'],
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatDialogModule, 
    MatInputModule, FormsModule, MatSelectModule, MatOptionModule, 
    MatIconModule, MatListModule, MatCardModule, MatTooltipModule, 
    MatPaginatorModule, MatTableModule, MatPseudoCheckboxModule,
    MatCheckboxModule
  ]
})
export class ModalAssignUsersComponent implements OnInit {
    // Lista completa de usuarios cargados
    usersList: any[] = [];
    // Lista filtrada para mostrar en la tabla (útil si implementas búsqueda)
    filteredUsers: any[] = [];
    // Término de búsqueda (si implementas filtro por nombre/email)
    searchTerm = '';
    // Estado del checkbox "seleccionar todos"
    selectAll = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { projectId: number }, // Recibe el ID del proyecto al que se asignarán usuarios
        private readonly dialogRef: MatDialogRef<ModalAssignUsersComponent>, // Referencia al modal para cerrarlo
        private readonly projectService: ProjectService, // Servicio para operaciones de proyectos
        private readonly usersService: UsersService // Servicio para operaciones de usuarios
    ) {}

    ngOnInit(): void {
        this.getUsers(); // Al iniciar, carga la lista de usuarios disponibles
    }

    // Obtiene todos los usuarios y filtra solo los de rol "Usuario" (rol_id === 2)
    getUsers(): void {
        this.usersService.getAllUsers().subscribe({
            next: (response) => {
                // Ajusta según la estructura real de la respuesta del backend
                const users = Array.isArray(response) ? response : response.users || response.data || [];
                interface AssignableUser extends User {
                  selected: boolean; // Marca si el usuario está seleccionado para asignar
                }

                this.usersList = (users as User[])
                  .filter((user: User) => user.rol_id === 2) // Solo usuarios normales
                  .map((user: User): AssignableUser => ({ ...user, selected: false }));
                this.filteredUsers = [...this.usersList]; // Inicialmente, todos los usuarios están en la lista filtrada
            },
            error: (error) => {
                console.error('Error al obtener usuarios:', error);
            }
        });
    }

    // Marca o desmarca todos los usuarios en la lista
    toggleAllUsers(selectAll: boolean): void {
      this.selectAll = selectAll;
      this.usersList.forEach(user => user.selected = selectAll);
    }

    // Asigna los usuarios seleccionados al proyecto
    assignSelectedUsers(): void {
        const selectedUsers = this.usersList.filter(user => user.selected);
        if (selectedUsers.length === 0) {
            return; // No hay usuarios seleccionados, no hace nada
        }
        const userIds = selectedUsers.map(user => user.id);
        this.projectService.assignUsersToProject({
            projectId: this.data.projectId,
            userIds
        }).subscribe({
            next: () => {
                this.dialogRef.close(true); // Cierra el modal y notifica éxito
            },
            error: (error) => {
                console.error('Error al asignar usuarios:', error);
            }
        });
    }

    // Cierra el modal sin hacer cambios
    closeDialog(): void {
        this.dialogRef.close();
    }
}
