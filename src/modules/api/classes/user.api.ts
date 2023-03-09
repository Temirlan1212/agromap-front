import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../models/user.model';

export class UserApi {
  constructor(private http: HttpClient) {}

  async logIn(data: Partial<IUser>): Promise<IUser> {
    const response = await firstValueFrom(
      this.http.post<IUser>('login_agromap', data)
    );

    if (document != null && response != null) {
      const ms = new Date().getTime() + 86400000;
      document.cookie = `user=${JSON.stringify(response)}; expires=${ms}`;
    }

    return response;
  }

  logOut(): boolean {
    let result = false;

    if (document != null) {
      document.cookie = 'user=;';
      result = true;
    }

    return result;
  }

  getLoggedInUser(): IUser | null {
    let result = null;

    if (document != null) {
      const cookies = document.cookie
        .split('; ')
        .reduce((prev: Record<string, string>, current: string) => {
          const [name, ...value] = current.split('=');
          prev[name] = value.join('=');
          return prev;
        }, {});

      if (typeof cookies['user'] === 'string' && cookies['user'] != '') {
        result = JSON.parse(cookies['user']);
      }
    }

    return result;
  }
}
