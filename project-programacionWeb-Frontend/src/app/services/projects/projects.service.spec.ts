import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './projects.service';
import { URL_SERVICIOS } from '@core/models/config';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const baseUrl = `${URL_SERVICIOS}/api/v1/projects`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener todos los proyectos', () => {
    const mockProjects = [{ id: 1, nombre: 'Proyecto 1' }, { id: 2, nombre: 'Proyecto 2' }];

    service.getAllProjects().subscribe(projects => {
      expect(projects).toEqual(mockProjects);
    });

    const req = httpMock.expectOne(`${baseUrl}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });

  it('debería obtener un proyecto por su ID', () => {
    const mockProject = { id: 1, nombre: 'Proyecto 1' };

    service.getProjectById('1').subscribe(project => {
      expect(project).toEqual(mockProject);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProject);
  });

  it('debería crear un nuevo proyecto', () => {
    const newProject = { nombre: 'Nuevo Proyecto', descripcion: 'Descripción' };

    service.createProject(newProject).subscribe(response => {
      expect(response).toEqual(newProject);
    });

    const req = httpMock.expectOne(`${baseUrl}/create`);
    expect(req.request.method).toBe('POST');
    req.flush(newProject);
  });

  it('debería actualizar un proyecto', () => {
    const updatedProject = { nombre: 'Proyecto Modificado', descripcion: 'Nueva descripción' };

    service.updateProject('1', updatedProject).subscribe(response => {
      expect(response).toEqual(updatedProject);
    });

    const req = httpMock.expectOne(`${baseUrl}/update/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedProject);
  });

  it('debería eliminar un proyecto', () => {
    service.deleteProject('1').subscribe(response => {
      expect(response).toEqual({ message: 'Proyecto eliminado con éxito' });
    });

    const req = httpMock.expectOne(`${baseUrl}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Proyecto eliminado con éxito' });
  });

  it('debería asociar usuarios a un proyecto', () => {
    const associationData = { projectId: 1, userIds: [2, 3] };

    service.assignUsersToProject(associationData).subscribe(response => {
      expect(response).toEqual(associationData);
    });

    const req = httpMock.expectOne(`${baseUrl}/associate`);
    expect(req.request.method).toBe('POST');
    req.flush(associationData);
  });

  it('debería desasociar usuarios de un proyecto', () => {
    const disassociationData = { projectId: 1, userId: 2 };

    service.removeUserFromProject(disassociationData.projectId, disassociationData.userId).subscribe(response => {
      expect(response).toEqual(disassociationData);
    });

    const req = httpMock.expectOne(`${baseUrl}/disassociate`);
    expect(req.request.method).toBe('DELETE');
    req.flush(disassociationData);
  });
});
