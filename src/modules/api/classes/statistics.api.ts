import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  IContourStatisticsProductivityQuery,
  IContourStatisticsProductivity,
} from '../models/statistics.model';

export class StatisticsApi {
  constructor(private http: HttpClient) {}

  async getContourStatisticsProductivity(
    query: IContourStatisticsProductivityQuery
  ): Promise<IContourStatisticsProductivity> {
    const response = await firstValueFrom(
      this.http.get<IContourStatisticsProductivity>(
        `gip/contour-statistics-productivity`,
        {
          params: Object.fromEntries(
            Object.entries(query).filter(([_, v]) => v != null)
          ) as any,
        }
      )
    );
    return response;
  }
}
