import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class IsSuperAdminGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    if (!this.api.user.getLoggedInUser()?.is_superuser) {
      await this.router.navigate(['profile']);
      return false;
    }

    return true;
  }
}
