/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from '@core/models/config';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private urlBaseServices = `${URL_SERVICIOS}/api/v1/projects`;

  constructor(private readonly http: HttpClient) {}

  getAllProjects(): Observable<any> {
    return this.http.get<any>(`${this.urlBaseServices}`);
  }

  getProjectById(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.urlBaseServices}/${projectId}`);
  }

  createProject(projectData: any): Observable<any> {
    return this.http.post<any>(`${this.urlBaseServices}/create`, projectData);
  }

  updateProject(projectId: string, projectData: any): Observable<any> {
    return this.http.put<any>(`${this.urlBaseServices}/update/${projectId}`, projectData);
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBaseServices}/delete/${projectId}`);
  }

  assignUsersToProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.urlBaseServices}/associate`, data);
  }

  removeUserFromProject(projectId: number, userId: number): Observable<any> {
    const data = { projectId, userId };
    return this.http.delete<any>(`${this.urlBaseServices}/disassociate`, { body: data });
  }

  getUsersByProjectId(projectId: number): Observable<any[]> {
    // Ajusta la URL según tu backend
    return this.http.get<any[]>(`/api/projects/${projectId}/users`);
  }
  
  getProjectsByUserId(userId: number) {
  return this.http.get<{ projects: any[] }>(`${this.urlBaseServices}/user/${userId}`);
}
}
