/* eslint-disable @typescript-eslint/no-explicit-any */
// Importación de módulos necesarios para la autenticación y manejo de sesiones
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from '@core/models/config';
import * as jwt from "jwt-decode";
import { BehaviorSubject, Observable } from 'rxjs';
import { ROLES } from '@core/models/enums';
import { User } from '@core/models/User';

// Decorador que indica que el servicio es inyectable en toda la aplicación
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getUser() {
    throw new Error('Method not implemented.');
  }
  getRoleInfoByToken() {
    throw new Error('Method not implemented.');
  }

  // URL base de los servicios de autenticación
  urlBaseServices: string = URL_SERVICIOS;
  
  // Observable para almacenar la información del usuario autenticado
  currentUserSubject: any;
  currentUser: any;

  constructor( private readonly http: HttpClient, private readonly router: Router) {
    // Inicializar `currentUserSubject` con datos del usuario guardados en `sessionStorage`
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(sessionStorage.getItem('currentUser') || '{}')
    );

    this.currentUser = this.currentUserSubject.asObservable;
  }

  // Método para iniciar sesión con email y contraseña
  login(email: string, password: string): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/auth/login`;
    return this.http.post<any>(endpoint, { email, password });
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const accessToken = sessionStorage.getItem('accessToken');
    return accessToken !== null;
  }

  // Obtener información del usuario autenticado desde el `sessionStorage`
  getAuthFromSessionStorage(): any {
    try {
      const lsValue = sessionStorage.getItem('accessToken');
      if (!lsValue) {
        return undefined;
      }

      // Decodificar el token almacenado
      const decodedToken: any = jwt.jwtDecode(lsValue);
      return decodedToken;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return undefined;
    }
  }

  // Almacenar el token de acceso en `sessionStorage`
  setToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  // Obtener el token almacenado en `sessionStorage`
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // Método para verificar si el usuario autenticado tiene rol de administrador
  isAdminLogged(): boolean {
    const userInfo = this.getAuthFromSessionStorage();
    return userInfo?.rol_id === ROLES.ADMIN;
  }

  // Método para verificar si el usuario autenticado tiene rol de usuario estándar
  isUserLogged(): boolean {
    const userInfo = this.getAuthFromSessionStorage();
    return userInfo?.rol_id === ROLES.USER;
  }

  // Obtener el token de acceso desde `sessionStorage` (potencial error en clave de almacenamiento)
  getTokenFromSessionStorage(): string | null {
    const isValue = sessionStorage.getItem('acessToken'); // ⚠️ Posible error en la clave (debe ser `accessToken`)
    return isValue;
  }

  // Método para cerrar sesión del usuario
  logout() {
    sessionStorage.removeItem('token'); // Eliminar el token de sesión
    this.router.navigate(['/authentication/signin'], { queryParams: {} }); // Redirigir al inicio de sesión
  }

  // Verificar si el usuario autenticado tiene acceso a un proyecto específico
  verifyProjectAccess(projectId: string): boolean {
    const userInfo = this.getAuthFromSessionStorage();
    if (!userInfo) return false;

    return !!userInfo.projects?.includes(projectId);
  }

  // Método para verificar si el usuario autenticado es administrador de un proyecto específico
  isProjectAdmin(projectId: string): boolean {
    const userInfo = this.getAuthFromSessionStorage();
    if (!userInfo) return false;

    return userInfo.role === ROLES.ADMIN && userInfo.projects?.includes(projectId);
  }
}


