import { HttpClient } from '@angular/common/http';
import { firstValueFrom, interval, Observable, switchMap } from 'rxjs';
import { IPassword, IProfile, IUser } from '../models/user.model';
import { INotification } from '../models/notification.model';

export class UserApi {
  constructor(private http: HttpClient) {}

  async logIn(data: Partial<IUser>): Promise<IUser> {
    const response = await firstValueFrom(
      this.http.post<IUser>('account/login_agromap', data)
    );

    if (document != null && response != null) {
      const nowDate = new Date();
      nowDate.setTime(nowDate.getTime() + 86400000);

      let userCookie = `user=${JSON.stringify(response)};`;
      userCookie += `expires=${nowDate.toUTCString()};`;
      userCookie += 'path=/';

      document.cookie = userCookie;
    }

    return response;
  }

  async logOut(): Promise<boolean> {
    let result = false;

    if (document != null) {
      let userCookie = 'user=;';
      userCookie += 'path=/';

      document.cookie = userCookie;
      result = true;
    }

    return result;
  }

  getLoggedInUser(): IUser | null {
    let result = null;

    if (document != null) {
      const cookies = document.cookie
        .split(';')
        .reduce((prev: Record<string, string>, current: string) => {
          const [name, ...value] = current.split('=');
          prev[name.trim()] = value.join('=');
          return prev;
        }, {});

      if (typeof cookies['user'] === 'string' && cookies['user'] != '') {
        result = JSON.parse(cookies['user']);
      }
    }

    return result;
  }

  async getUser(): Promise<IProfile> {
    return await firstValueFrom(this.http.get<IProfile>(`account/get_profile`));
  }

  async updatePassword(data: IPassword): Promise<IPassword> {
    return await firstValueFrom(
      this.http.post<IPassword>(`account/change_password`, data)
    );
  }

  async updateProfile(data: IProfile): Promise<IProfile> {
    return await firstValueFrom(
      this.http.patch<IProfile>(`account/edit_profile`, data)
    );
  }

  async getNotifications(): Promise<INotification[]> {
    return await firstValueFrom(
      this.http.get<INotification[]>(`account/notifications`)
    );
  }

  async removeNotification(
    id: number,
    data: INotification
  ): Promise<Record<string, any>> {
    return await firstValueFrom(
      this.http.patch<Record<string, any>>(
        `account/notifications-delete/${id}`,
        data
      )
    );
  }

  async updateNotifications(
    id: number,
    data: INotification
  ): Promise<Record<string, any>> {
    return await firstValueFrom(
      this.http.patch<Record<string, any>>(
        `account/notifications-update/${id}`,
        data
      )
    );
  }

  notifications: Observable<INotification[]> = interval(1000 * 3600 * 4).pipe(
    switchMap(() => {
      return this.getNotifications();
    })
  );
}
