import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl, API_ENDPOINTS } from '../constants/api.constants';
import type { Booking, ClientAddBookingRequest, ClientChangeBookingStatusRequest, Room } from '../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(getApiUrl(API_ENDPOINTS.ROOMS.GET_ALL));
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(getApiUrl(API_ENDPOINTS.CLIENT.GET_ALL_BOOKINGS));
  }

  addBooking(request: ClientAddBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(getApiUrl(API_ENDPOINTS.CLIENT.ADD_BOOKING), request);
  }

  changeBookingStatus(bookingId: number, request: ClientChangeBookingStatusRequest): Observable<Booking> {
    return this.http.put<Booking>(getApiUrl(API_ENDPOINTS.CLIENT.CHANGE_BOOKING_STATUS(bookingId)), request);
  }
}
