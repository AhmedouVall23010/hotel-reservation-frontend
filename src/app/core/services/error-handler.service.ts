import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import type { ErrorResponse, ValidationErrorResponse } from '../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Erreur de connexion au serveur. Veuillez réessayer plus tard.';
    }

    if (error.error) {
      const errorData = error.error as ErrorResponse | ValidationErrorResponse;

      if ('details' in errorData && errorData.details) {
        const firstError = Object.values(errorData.details)[0];
        return firstError || 'Erreur de validation des données.';
      }

      if ('message' in errorData && errorData.message) {
        return errorData.message;
      }

      if ('error' in errorData && errorData.error) {
        return errorData.error;
      }
    }

    switch (error.status) {
      case 400:
        return 'Requête invalide. Veuillez vérifier les données saisies.';
      case 401:
        return 'Non autorisé. Veuillez vous connecter.';
      case 403:
        return "Vous n'avez pas la permission d'accéder à cette ressource.";
      case 404:
        return 'La ressource demandée est introuvable.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      default:
        return 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.';
    }
  }
}