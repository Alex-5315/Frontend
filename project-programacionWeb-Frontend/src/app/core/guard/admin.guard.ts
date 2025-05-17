import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {

    constructor(private readonly _authService: AuthService, private readonly _router: Router) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const userSession = this._authService.getAuthFromSessionStorage();
            console.log(userSession);
            
        if (userSession && userSession.rol_id === 1) {
            return true;
        } else {
            this._router.navigate(['/authentication/page404']);
            return false;
        }
    }
}