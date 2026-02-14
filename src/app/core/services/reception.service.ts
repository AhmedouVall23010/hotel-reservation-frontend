import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl, API_ENDPOINTS, BookingStatus } from '../constants/api.constants';
import type {
  Room,
  Booking,
  ReceptionAddBookingRequest,
  ReceptionUpdateBookingRequest,
  ReceptionChangeStatusRequest,
  ReceptionUpdateBookingResponse,
  ReceptionChangeStatusResponse,
} from '../../shared/types';

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

  getActiveBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(getApiUrl(API_ENDPOINTS.RECEPTION.BOOKINGS_ACTIVE));
  }

  addBooking(booking: ReceptionAddBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(getApiUrl(API_ENDPOINTS.RECEPTION.BOOKINGS_ADD), booking);
  }

  updateBooking(id: number, booking: ReceptionUpdateBookingRequest): Observable<ReceptionUpdateBookingResponse> {
    return this.http.put<ReceptionUpdateBookingResponse>(getApiUrl(API_ENDPOINTS.RECEPTION.BOOKINGS_UPDATE(id)), booking);
  }

  changeBookingStatus(id: number, request: ReceptionChangeStatusRequest): Observable<ReceptionChangeStatusResponse> {
    return this.http.put<ReceptionChangeStatusResponse>(getApiUrl(API_ENDPOINTS.RECEPTION.BOOKINGS_CHANGE_STATUS(id)), request);
  }

  deleteBooking(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(getApiUrl(API_ENDPOINTS.RECEPTION.BOOKINGS_DELETE(id)));
  }
}
