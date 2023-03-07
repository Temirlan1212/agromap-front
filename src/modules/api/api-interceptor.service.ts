import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry, timer } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiInterceptorService implements HttpInterceptor {
  private apiErrorCallback: (error: HttpErrorResponse) => Promise<boolean> =
    async (error: HttpErrorResponse) => false;

  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const apiRequest = request.clone({
      url: `${environment.apiUrl}/${request.url}/`,
    });

    return next.handle(apiRequest).pipe(
      retry({
        count: 1,
        delay: async (error: HttpErrorResponse) => {
          const apiErrorCallbackResult = await this.apiErrorCallback(error);

          if (apiErrorCallbackResult) {
            return timer(1);
          }

          throw error;
        },
      })
    );
  }

  setApiErrorCallback(
    callback: (error: HttpErrorResponse) => Promise<boolean>
  ) {
    this.apiErrorCallback = callback;
  }
}
