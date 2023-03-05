import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, retry, timer } from "rxjs";

@Injectable({ providedIn: "root" })
export class ApiErrorService implements HttpInterceptor {
    private apiErrorCallback!: (error: HttpErrorResponse) => Promise<boolean>;

    constructor() { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            retry({
                count: 1,
                delay: async (error: HttpErrorResponse) => {
                    const apiErrorCallbackResult = await this.apiErrorCallback(error);

                    if (apiErrorCallbackResult) {
                        return timer(1);
                    }

                    throw error;
                }
            })
        );
    }

    setApiErrorCallback(callback: (error: HttpErrorResponse) => Promise<boolean>) {
        this.apiErrorCallback = callback;
    }
}
