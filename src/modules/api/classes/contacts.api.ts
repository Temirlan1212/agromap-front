import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IDepartment } from '../models/contacts.model';

export class ContactsApi {
  constructor(private http: HttpClient) {}

  async getDepartmentList(): Promise<IDepartment[]> {
    return await firstValueFrom(this.http.get<IDepartment[]>(`gip/department`));
  }

  async getContactInformation(id: string | number): Promise<IDepartment[]> {
    return await firstValueFrom(
      this.http.get<IDepartment[]>(`gip/contact-information`, {
        params: { department: id },
      })
    );
  }
}
