import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { getApiUrl, API_ENDPOINTS, STORAGE_KEYS, UserRole } from '../constants/api.constants';
import type { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, User } from '../../shared/types';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private errorHandler = inject(ErrorHandlerService);
  private platformId = inject(PLATFORM_ID);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = computed(() => !!this.getToken());
  public currentUser = signal<User | null>(this.getUserFromStorage());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(getApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        const user: User = {
          id: 0,
          nom: response.nom,
          prenom: response.prenom,
          email: response.email,
          role: response.role as UserRole,
        };
        this.setUser(user);
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.redirectByRole(user.role);
      }),
      catchError((error) => {
        return throwError(() => this.errorHandler.handleError(error));
      })
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(getApiUrl(API_ENDPOINTS.AUTH.REGISTER), data).pipe(
      tap((response) => {
        this.router.navigate(['/auth/login'], {
          queryParams: { registered: true },
        });
      }),
      catchError((error) => {
        return throwError(() => this.errorHandler.handleError(error));
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  }

  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  private getUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  private redirectByRole(role: UserRole): void {
    switch (role) {
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.RECEPTION:
        this.router.navigate(['/reception/dashboard']);
        break;
      case UserRole.USER:
        this.router.navigate(['/client/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}