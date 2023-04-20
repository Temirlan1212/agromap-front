import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IInstruction } from '../models/instruction.model';

export class AiMiscApi {
  constructor(private http: HttpClient) {}

  async getInstruction(): Promise<IInstruction> {
    return await firstValueFrom(this.http.get<IInstruction>('ai/instruction'));
  }

  async createDataset(): Promise<void> {
    return await firstValueFrom(this.http.get<void>('ai/create-dataset'));
  }
}
