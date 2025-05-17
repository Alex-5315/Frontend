/* eslint-disable @typescript-eslint/no-explicit-any */ 
// Deshabilitar la regla eslint para permitir el uso de `any` en el código

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '@core/models/config';
import { Observable } from 'rxjs';

// Decorador que indica que el servicio será inyectable en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  // Definición de la URL base para los servicios
  urlBaseServices: string = URL_SERVICIOS;

  // Constructor que recibe una instancia de HttpClient para realizar peticiones HTTP
  constructor(private readonly http: HttpClient) { }

  // Método para crear un usuario en la base de datos
  createUser(userData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/create`; // Definición del endpoint
    return this.http.post<any>(endpoint, userData); // Envío de datos al backend mediante HTTP POST
  }

  // Método para actualizar la información de un usuario existente
  updateUser(userId: number, userData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/update/${userId}`; // Definición del endpoint con el ID del usuario
    return this.http.put<any>(endpoint, userData); // Envío de datos mediante HTTP PUT
  }

  // Método para eliminar un usuario de la base de datos
  deleteUser(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/delete/${userId}`; // Definición del endpoint con el ID del usuario
    return this.http.delete<any>(endpoint); // Envío de solicitud de eliminación mediante HTTP DELETE
  }

  // Método para obtener todos los usuarios administrados por un administrador
  getAllUserByAdministrator(filters?: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users`; // Definición del endpoint
    // Creación de parámetros HTTP para filtrar usuarios por nombre y email
    const params = new HttpParams({ fromObject: {
      nombre: filters?.name || '', // Filtro por nombre
      email: filters?.email || '' // Filtro por email
    } });
    return this.http.get<any>(endpoint, { params }); // Solicitud HTTP GET con filtros aplicados
  }

  // Método para obtener todos los administradores en el sistema
  getAllAdministrator(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/rol/1`; // Endpoint filtrando por rol de administrador
    return this.http.get<any>(endpoint); // Solicitud HTTP GET para obtener administradores
  }

  // Método para obtener todos los usuarios que no sean administradores
  getAllUsers(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/rol/2`; // Endpoint filtrando por rol de usuario estándar
    return this.http.get<any>(endpoint); // Solicitud HTTP GET para obtener usuarios
  }
}
