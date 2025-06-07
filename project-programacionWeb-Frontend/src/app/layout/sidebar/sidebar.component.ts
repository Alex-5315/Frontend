/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Importaciones necesarias para la funcionalidad del sidebar
import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { ROUTES } from './sidebar-items'; // Importación de las rutas del sidebar
import { AuthService } from '@core'; // Servicio de autenticación
import { RouteInfo } from './sidebar.metadata'; // Información de las rutas
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgScrollbar } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared'; // Manejador de eventos para desuscripción
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ROLES } from '@core/models/enums'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    NgScrollbar, // Manejador de barra de desplazamiento
    MatButtonModule, // Botones Material UI
    RouterLink, // Enlaces de navegación en el sidebar
    MatTooltipModule, // Tooltips para los botones
    RouterLinkActive, // Control de estado activo de rutas
    NgClass, // Manejador de clases dinámicas
  ],
})
export class SidebarComponent
  extends UnsubscribeOnDestroyAdapter // Extiende para manejar desuscripción de eventos
  implements OnInit, OnDestroy
{
  public sidebarItems!: RouteInfo[]; // Lista de elementos del sidebar
  public innerHeight?: number; // Altura interna de la ventana
  public bodyTag!: HTMLElement; // Elemento `<body>` del documento
  listMaxHeight?: string; // Altura máxima de la lista de navegación
  listMaxWidth?: string; // Anchura máxima de la lista de navegación
  userFullName?: string; // Nombre completo del usuario autenticado
  userImg?: string; // Imagen de perfil del usuario autenticado
  userType?: string; // Tipo de usuario autenticado
  headerHeight = 60; // Altura fija del encabezado
  currentRoute?: string; // Ruta actual activa

  userLogged: string | undefined = ''; // Usuario autenticado en sesión

  userRole: 'admin' | 'user' = 'user';
  adminImgUrl = 'assets/images/Uso-real/groot.gif';
  userImgUrl = 'assets/images/Uso-real/fino.jpg';

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document, // Inyección del documento DOM
    private readonly _renderer: Renderer2, // Servicio para manipulación del DOM
    public readonly _elementRef: ElementRef, // Referencia al elemento HTML del componente
    private readonly _authService: AuthService, // Servicio de autenticación
    private readonly _router: Router, // Servicio de rutas de Angular
    private readonly _domSanitizer: DomSanitizer // Servicio para sanitizar contenido HTML
  ) {
    super();

    // Escuchar eventos de navegación para cerrar el sidebar en dispositivos móviles
    this.subs.sink = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._renderer.removeClass(this._document.body, 'overlay-open'); // Cerrar el overlay al cambiar de ruta
      }
    });

    // Código comentado que se podría restaurar para obtener la información del usuario autenticado
    // const roleInfo = this._authService.getRoleInfoByToken();
    // this.userLogged = roleInfo ? roleInfo.roleName : undefined;
  }

  // Detectar cambios en la ventana para ajustar el menú
  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }

  // Detectar clics fuera del sidebar para cerrarlo automáticamente
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this._renderer.removeClass(this._document.body, 'overlay-open');
    }
  }

  // Método para alternar el estado de activación de los menús dentro del sidebar
  callToggleMenu(event: Event, length: number): void {
    if (!this.isValidLength(length) || !this.isValidEvent(event)) {
      return;
    }

    const parentElement = (event.target as HTMLElement).closest('li');
    if (!parentElement) {
      return;
    }

    const activeClass = parentElement.classList.contains('active');

    if (activeClass) {
      this._renderer.removeClass(parentElement, 'active');
    } else {
      this._renderer.addClass(parentElement, 'active');
    }
  }

  // Verificación de la longitud de los elementos antes de procesar eventos
  private isValidLength(length: number): boolean {
    return length > 0;
  }

  // Validación de evento para asegurarse de que es un clic válido
  private isValidEvent(event: Event): boolean {
    return event && event.target instanceof HTMLElement;
  }

  // Método para limpiar contenido HTML y evitar posibles vulnerabilidades
  sanitizeHtml(html: string): SafeHtml {
    return this._domSanitizer.bypassSecurityTrustHtml(html);
  }

  rolAuthority: any;
  // Método ejecutado al inicializar el componente
  ngOnInit() {
    const user = this._authService.getAuthFromSessionStorage();
    this.userRole = user.rol_id === ROLES.ADMIN ? 'admin' : 'user';

    const rolAuthority = this._authService.getAuthFromSessionStorage().rol_id;
    this.rolAuthority = rolAuthority;

    // Filtrar las rutas disponibles según el rol del usuario
    this.sidebarItems = ROUTES.filter((sidebarItem) =>
      sidebarItem?.rolAuthority.includes(rolAuthority)
    );

    this.initLeftSidebar();
    this.bodyTag = this._document.body; // Manipular estilos generales
  }

  // Inicialización del sidebar ajustando su tamaño y configuración
  initLeftSidebar() {
    const _this = this;
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }

  // Ajustar la altura del menú dinámicamente
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }

  // Verificar si el menú está abierto
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }

  // Ajustar el menú dependiendo del tamaño de la pantalla
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this._renderer.addClass(this._document.body, 'ls-closed');
    } else {
      this._renderer.removeClass(this._document.body, 'ls-closed');
    }
  }

  // Manejo de eventos de hover para mostrar el menú lateral
  mouseHover() {
    const body = this._elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this._renderer.addClass(this._document.body, 'side-closed-hover');
      this._renderer.removeClass(this._document.body, 'submenu-closed');
    }
  }

  // Manejo de eventos de salida del mouse para ocultar el menú lateral
  mouseOut() {
    const body = this._elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this._renderer.removeClass(this._document.body, 'side-closed-hover');
      this._renderer.addClass(this._document.body, 'submenu-closed');
    }
  }

  getUserRole(rolId: number): string {
    switch (rolId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Usuario';
      default:
        return 'Desconocido';
    }
  }
}
