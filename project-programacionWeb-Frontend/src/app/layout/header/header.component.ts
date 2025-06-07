import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '@config';
import { InConfiguration, AuthService } from '@core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ROLES } from '@core/models/enums'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    MatButtonModule,
    MatMenuModule,
    FeatherIconsComponent,
  ],
})
export class HeaderComponent implements OnInit {
  public config!: InConfiguration;
  isNavbarCollapsed = true;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;
  userRole: 'admin' | 'user' = 'user';
  adminImgUrl = 'assets/images/Uso-real/admin-avatar.png';
  userImgUrl = 'assets/images/Uso-real/pepe-matrix.gif';

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    public readonly elementRef: ElementRef,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    const user = this.authService.getAuthFromSessionStorage();
    this.userRole = user.rol_id === ROLES.ADMIN ? 'admin' : 'user';
    this.userLogged = this.authService.getAuthFromSessionStorage().nombre;
   }


   
  ngOnInit() {
    this.config = this.configService.configData;
    this.docElement = document.documentElement;
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }
  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }
  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'true');
    }
  }

  logout() {
    this.authService.logout();
  }

  userLogged: string | undefined = '';
}
