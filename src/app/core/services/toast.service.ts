import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Toast, ToastType, ToastOptions } from '../../shared/types/toast.types';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private platformId = inject(PLATFORM_ID);

  private readonly DEFAULT_DURATIONS: Record<ToastType, number> = {
    success: 5000,
    info: 5000,
    warning: 8000,
    error: 8000,
  };

  private _toasts = signal<Toast[]>([]);
  public toasts = this._toasts.asReadonly();

  private idCounter = 0;

  private generateId(): string {
    if (isPlatformBrowser(this.platformId) && typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `toast-${++this.idCounter}-${Date.now()}`;
  }

  show(type: ToastType, message: string, options?: ToastOptions): string {
    const id = this.generateId();
    const duration = options?.duration ?? this.DEFAULT_DURATIONS[type];

    const toast: Toast = {
      id,
      type,
      message,
      duration,
      createdAt: Date.now(),
    };

    this._toasts.update(toasts => [...toasts, toast]);

    if (isPlatformBrowser(this.platformId) && duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  success(message: string, options?: ToastOptions): string {
    return this.show('success', message, options);
  }

  error(message: string, options?: ToastOptions): string {
    return this.show('error', message, options);
  }

  warning(message: string, options?: ToastOptions): string {
    return this.show('warning', message, options);
  }

  info(message: string, options?: ToastOptions): string {
    return this.show('info', message, options);
  }

  dismiss(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
