import { Injectable } from "@angular/core";
import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import {
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
} from "rxjs/operators";
import { btcBaseUrl } from "./config";

const SESSION_PATHS = ["/api/login", "/api/registration", "/api/auth/"];
const REFRESH_PATH = "/api/auth/refresh/";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private http: HttpClient;
  private refreshing: Observable<string> | null = null;

  constructor(backend: HttpBackend, private router: Router) {
    // Built on the raw backend so the refresh call itself never passes through this interceptor
    this.http = new HttpClient(backend);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(btcBaseUrl)) {
      return next.handle(req);
    }

    const path = req.url.slice(btcBaseUrl.length);
    // The refresh token is an HttpOnly cookie: only the session calls may set or send it
    const request = SESSION_PATHS.some((prefix) => path.startsWith(prefix))
      ? req.clone({ withCredentials: true })
      : req;

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const expired =
          error.status === 401 &&
          error.error &&
          error.error.code === "token_expired";
        if (!expired) {
          return throwError(error);
        }

        return this.refreshKey().pipe(
          catchError(() => {
            localStorage.removeItem("accessToken");
            this.router.navigate([""]);
            return throwError(error);
          }),
          switchMap((key) =>
            next.handle(
              request.clone({ setHeaders: { Authorization: `Token ${key}` } })
            )
          )
        );
      })
    );
  }

  // One refresh at a time: requests that expire together all wait for the same new key
  private refreshKey(): Observable<string> {
    if (!this.refreshing) {
      this.refreshing = this.http
        .post<{ key: string }>(`${btcBaseUrl}${REFRESH_PATH}`, null, {
          withCredentials: true,
        })
        .pipe(
          map((res) => res.key),
          tap((key) => localStorage.setItem("accessToken", key)),
          finalize(() => (this.refreshing = null)),
          shareReplay(1)
        );
    }
    return this.refreshing;
  }
}
