// Importación de módulos necesarios para la configuración y pruebas de Angular
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service'; // Importación del servicio de autenticación

// Definición del bloque de pruebas para `AuthService`
describe('AuthService', () => {
  let service: AuthService; // Variable para almacenar la instancia del servicio

  // Configuración inicial antes de ejecutar las pruebas
  beforeEach(() => {
    TestBed.configureTestingModule({}); // Configura el entorno de prueba de Angular
    service = TestBed.inject(AuthService); // Inyecta una instancia del servicio en el entorno de prueba
  });

  // Prueba para verificar que el servicio se ha creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Comprueba que el servicio existe y no es `null` o `undefined`
  });
});
