import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { getApiUrl, API_ENDPOINTS } from '../constants/api.constants';
import type { Booking, ClientAddBookingRequest, ClientChangeBookingStatusRequest } from '../../shared/types';
import { PublicService } from './public.service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private publicService = inject(PublicService);

  // Note: getAllRooms has been moved to PublicService as it's a public endpoint
  // Use publicService.getAllRooms() instead

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(getApiUrl(API_ENDPOINTS.CLIENT.GET_ALL_BOOKINGS));
  }

  addBooking(request: ClientAddBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(getApiUrl(API_ENDPOINTS.CLIENT.ADD_BOOKING), request);
  }

  changeBookingStatus(bookingId: number, request: ClientChangeBookingStatusRequest): Observable<Booking> {
    return this.http.put<Booking>(getApiUrl(API_ENDPOINTS.CLIENT.CHANGE_BOOKING_STATUS(bookingId)), request);
  }

  /**
   * Enhanced booking with date validation
   * Checks reserved dates before creating a booking
   */
  async addBookingWithValidation(request: ClientAddBookingRequest): Promise<Booking> {
    try {
      // First check if dates are available
      const reservedDates = await firstValueFrom(
        this.publicService.getReservedDates(request.roomId)
      );

      // Validate dates don't conflict
      if (this.datesConflict(request.startDate, request.endDate, reservedDates)) {
        throw new Error('Selected dates are not available for this room');
      }

      // If validation passes, create the booking
      return await firstValueFrom(this.addBooking(request));
    } catch (error) {
      console.error('Booking validation failed:', error);
      throw error;
    }
  }

  /**
   * Check if requested dates conflict with existing reservations
   */
  private datesConflict(startDate: string, endDate: string, reservedPeriods: Array<{ startDate: string; endDate: string }>): boolean {
    if (!reservedPeriods || reservedPeriods.length === 0) {
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return reservedPeriods.some(period => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      
      return (start >= periodStart && start <= periodEnd) ||
             (end >= periodStart && end <= periodEnd) ||
             (start <= periodStart && end >= periodEnd);
    });
  }
}
