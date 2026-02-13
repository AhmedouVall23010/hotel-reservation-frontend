import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import type { ToastType } from '../../types/toast.types';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto w-80 backdrop-blur-sm animate-toast-in"
          [class]="getToastClasses(toast.type)"
          role="alert"
          aria-live="polite"
        >
          <div class="flex items-start gap-3 px-5 py-4">
            <div class="flex-shrink-0 mt-0.5">
              @switch (toast.type) {
                @case ('success') {
                  <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                }
                @case ('error') {
                  <svg class="w-4 h-4 text-error" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                }
                @case ('warning') {
                  <svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                }
                @case ('info') {
                  <svg class="w-4 h-4 text-stone" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                }
              }
            </div>

            <p class="flex-1 font-sans text-sm text-charcoal font-light leading-relaxed">
              {{ toast.message }}
            </p>

            <button
              (click)="dismiss(toast.id)"
              class="flex-shrink-0 text-sand hover:text-stone transition-colors duration-300 mt-0.5"
              aria-label="Fermer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    :host {
      display: contents;
    }

    .animate-toast-in {
      animation: toastIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
  `]
})
export class ToastContainerComponent {
  protected toastService = inject(ToastService);

  getToastClasses(type: ToastType): string {
    const base = 'pointer-events-auto w-80 backdrop-blur-sm animate-toast-in border bg-ivory/95';
    switch (type) {
      case 'success':
        return `${base} border-success/20`;
      case 'error':
        return `${base} border-error/20`;
      case 'warning':
        return `${base} border-warning/20`;
      case 'info':
        return `${base} border-sand`;
      default:
        return `${base} border-sand`;
    }
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
