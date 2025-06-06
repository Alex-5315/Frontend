import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';

// Definición del bloque de pruebas para `ProjectsComponent`
describe('ProjectsComponent', () => {
  let component: ProjectsComponent; // Variable para almacenar la instancia del componente
  let fixture: ComponentFixture<ProjectsComponent>; // Variable para manejar la estructura del componente en el entorno de prueba

  // Configuración inicial antes de ejecutar las pruebas
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent] // Configuración del módulo de prueba con el componente
    })
    .compileComponents(); // Compila los componentes necesarios para la prueba

    fixture = TestBed.createComponent(ProjectsComponent); // Crea una instancia de `ProjectsComponent`
    component = fixture.componentInstance; // Asigna el componente a la variable `component`
    fixture.detectChanges(); // Ejecuta la detección de cambios en el componente
  });

  // Prueba unitaria para verificar que el componente se crea correctamente
  it('should create', () => {
    expect(component).toBeTruthy(); // Comprueba que el componente existe y está correctamente instanciado
  });
});
