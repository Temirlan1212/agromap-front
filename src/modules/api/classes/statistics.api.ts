import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  IContourStatisticsProductivityQuery,
  IContourStatisticsProductivity,
  ICulutreStatisticsQuery,
  ICulutreStatistics,
} from '../models/statistics.model';

export class StatisticsApi {
  constructor(private http: HttpClient) {}

  async getPastureStatisticsProductivity(
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

  async getCultureStatistics(
    query: ICulutreStatisticsQuery
  ): Promise<ICulutreStatistics[]> {
    const response = await firstValueFrom(
      this.http.get<ICulutreStatistics[]>(`gip/culture-statistics`, {
        params: Object.fromEntries(
          Object.entries(query).filter(([_, v]) => v != null)
        ) as any,
      })
    );
    return response;
  }
}
