import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getApiUrl } from '../constants/api.constants';
import type { Room } from '../../shared/types';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);

  /**
   * Get all rooms (public endpoint - no auth required)
   * Backend: GET /api/rooms
   */
  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(getApiUrl('/rooms')).pipe(
      catchError((error) => {
        console.error('Error fetching rooms:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  /**
   * Get reserved dates for a specific room
   * Backend: GET /api/rooms/dates-reserved/{roomId}
   */
  getReservedDates(roomId: number): Observable<string[]> {
    return this.http.get<string[]>(getApiUrl(`/rooms/dates-reserved/${roomId}`)).pipe(
      catchError((error) => {
        console.error(`Error fetching reserved dates for room ${roomId}:`, error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  /**
   * Get detailed information for a specific room
   * This could be useful for a room detail page
   */
  getRoomDetails(roomId: number): Observable<Room> {
    return this.http.get<Room>(getApiUrl(`/rooms/${roomId}`)).pipe(
      catchError((error) => {
        console.error(`Error fetching room details for room ${roomId}:`, error);
        return this.errorHandler.handleError(error);
      })
    );
  }
}