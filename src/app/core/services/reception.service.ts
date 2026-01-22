import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl, API_ENDPOINTS, BookingStatus } from '../constants/api.constants';
import type { Room, Booking } from '../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class ReceptionService {
  private http = inject(HttpClient);

  getRoomsAvailable(): Observable<Room[]> {
    return this.http.get<Room[]>(getApiUrl(API_ENDPOINTS.RECEPTION.ROOMS_AVAILABLE));
  }

  getRoomsReserved(): Observable<Room[]> {
    return this.http.get<Room[]>(getApiUrl(API_ENDPOINTS.RECEPTION.ROOMS_RESERVED));
  }

  getBookingsByStatus(status: BookingStatus): Observable<Booking[]> {
    return this.http.post<Booking[]>(getApiUrl(API_ENDPOINTS.RECEPTION.BOOKINGS_STATUS), { status });
  }
}
