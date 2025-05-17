// Importación de módulos necesarios para la configuración y ejecución de pruebas en Angular
import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service'; // Importación del servicio de alertas

// Definición del bloque de pruebas para `AlertService`
describe('AlertService', () => {
  let service: AlertService; // Variable para almacenar la instancia del servicio

  // Configuración inicial antes de ejecutar las pruebas
  beforeEach(() => {
    TestBed.configureTestingModule({}); // Configura el entorno de prueba de Angular
    service = TestBed.inject(AlertService); // Inyecta una instancia del servicio en el entorno de prueba
  });

  // Prueba para verificar que el servicio se ha creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Comprueba que el servicio existe y se ha instanciado correctamente
  });
});
