import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Erreur de connexion';
    }

    switch (error.status) {
      case 400:
        return 'Données invalides';
      case 401:
        return 'Non autorisé';
      case 403:
        return 'Accès refusé';
      case 404:
        return 'Ressource introuvable';
      case 409:
        return 'Conflit';
      case 500:
        return 'Erreur serveur';
      case 503:
        return 'Service indisponible';
      default:
        return 'Erreur inattendue';
    }
  }
}