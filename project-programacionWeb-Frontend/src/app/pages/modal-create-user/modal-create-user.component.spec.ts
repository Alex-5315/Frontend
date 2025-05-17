// Importaciones necesarias para la ejecución de pruebas unitarias en Angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateUserComponent } from './modal-create-user.component'; // Importación del componente a probar

// Definición del bloque de pruebas para `ModalCreateUserComponent`
describe('ModalCreateUserComponent', () => {
  let component: ModalCreateUserComponent; // Variable para almacenar la instancia del componente
  let fixture: ComponentFixture<ModalCreateUserComponent>; // Variable para manejar la estructura del componente en el entorno de prueba

  // Configuración inicial antes de ejecutar las pruebas
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCreateUserComponent] // Configuración del módulo de prueba con el componente
    })
    .compileComponents(); // Compila los componentes necesarios para la prueba

    fixture = TestBed.createComponent(ModalCreateUserComponent); // Crea una instancia de `ModalCreateUserComponent`
    component = fixture.componentInstance; // Asigna el componente a la variable `component`
    fixture.detectChanges(); // Ejecuta la detección de cambios en el componente
  });

  // Prueba unitaria para verificar que el componente se crea correctamente
  it('should create', () => {
    expect(component).toBeTruthy(); // Comprueba que el componente existe y está correctamente instanciado
  });
});

