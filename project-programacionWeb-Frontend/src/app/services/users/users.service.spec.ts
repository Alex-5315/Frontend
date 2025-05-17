// Importación de módulos necesarios para la configuración de pruebas en Angular
import { TestBed } from '@angular/core/testing';

import { UsersService } from './users.service'; // Importación del servicio de usuarios

// Definición del bloque de pruebas para `UsersService`
describe('UserService', () => {
  let service: UsersService; // Variable para almacenar la instancia del servicio

  // Configuración inicial antes de ejecutar las pruebas
  beforeEach(() => {
    TestBed.configureTestingModule({}); // Configura el entorno de prueba de Angular
    service = TestBed.inject(UsersService); // Inyecta una instancia del servicio en el entorno de prueba
  });

  // Prueba para verificar que el servicio se ha creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Comprueba que el servicio existe y no es `null` o `undefined`
  });
});
