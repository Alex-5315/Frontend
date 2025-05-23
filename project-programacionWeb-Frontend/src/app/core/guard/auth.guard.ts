import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(private readonly authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.isAuthenticated();
    if (currentUser) {
      return true;
    }

    // // not logged in so redirect to login page with the return url
    this.authService.logout();
    return false;
  }
}
