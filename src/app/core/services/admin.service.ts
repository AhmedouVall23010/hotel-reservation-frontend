import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl, API_ENDPOINTS } from '../constants/api.constants';
import type {
  User,
  UserWithAuthorities,
  AdminAddUserRequest,
  AdminUpdateUserRequest,
  Room,
  AdminAddRoomRequest,
  AdminUpdateRoomRequest,
  RoomChangeStatusResponse,
  RoomUpdateResponse,
  RoomDeleteResponse,
  Booking,
  AdminAddBookingRequest,
  AdminUpdateBookingRequest,
  AdminUpdateBookingResponse,
  AdminBookingAnalysis,
} from '../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  getMe(): Observable<UserWithAuthorities> {
    return this.http.get<UserWithAuthorities>(getApiUrl(API_ENDPOINTS.ADMIN_USERS.GET_ME));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(getApiUrl(API_ENDPOINTS.ADMIN_USERS.GET_ALL));
  }

  addUser(user: AdminAddUserRequest): Observable<User> {
    return this.http.post<User>(getApiUrl(API_ENDPOINTS.ADMIN_USERS.ADD), user);
  }

  updateUser(id: number, user: AdminUpdateUserRequest): Observable<User> {
    return this.http.put<User>(getApiUrl(API_ENDPOINTS.ADMIN_USERS.UPDATE(id)), user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(getApiUrl(API_ENDPOINTS.ADMIN_USERS.DELETE(id)));
  }

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(getApiUrl(API_ENDPOINTS.ADMIN_ROOMS.GET_ALL));
  }

  addRoom(room: AdminAddRoomRequest): Observable<Room> {
    const formData = new FormData();
    formData.append('roomNumber', room.roomNumber.toString());
    formData.append('description', room.description);
    formData.append('type', room.type);
    formData.append('price', room.price.toString());
    formData.append('image', room.image);

    return this.http.post<Room>(getApiUrl(API_ENDPOINTS.ADMIN_ROOMS.ADD), formData);
  }

  updateRoom(id: number, room: AdminUpdateRoomRequest): Observable<RoomUpdateResponse> {
    const formData = new FormData();
    if (room.roomNumber !== undefined) {
      formData.append('roomNumber', room.roomNumber.toString());
    }
    if (room.description !== undefined) {
      formData.append('description', room.description);
    }
    if (room.type !== undefined) {
      formData.append('type', room.type);
    }
    if (room.price !== undefined) {
      formData.append('price', room.price.toString());
    }
    if (room.image) {
      formData.append('image', room.image);
    }

    return this.http.put<RoomUpdateResponse>(getApiUrl(API_ENDPOINTS.ADMIN_ROOMS.UPDATE(id)), formData);
  }

  deleteRoom(id: number): Observable<RoomDeleteResponse> {
    return this.http.delete<RoomDeleteResponse>(getApiUrl(API_ENDPOINTS.ADMIN_ROOMS.DELETE(id)));
  }

  changeRoomStatus(id: number): Observable<RoomChangeStatusResponse> {
    return this.http.put<RoomChangeStatusResponse>(getApiUrl(API_ENDPOINTS.ADMIN_ROOMS.CHANGE_STATUS(id)), {});
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(getApiUrl(API_ENDPOINTS.ADMIN_BOOKINGS.GET_ALL));
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(getApiUrl(API_ENDPOINTS.ADMIN_BOOKINGS.GET_BY_ID(id)));
  }

  addBooking(booking: AdminAddBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(getApiUrl(API_ENDPOINTS.ADMIN_BOOKINGS.ADD), booking);
  }

  updateBooking(id: number, booking: AdminUpdateBookingRequest): Observable<AdminUpdateBookingResponse> {
    return this.http.put<AdminUpdateBookingResponse>(getApiUrl(API_ENDPOINTS.ADMIN_BOOKINGS.UPDATE(id)), booking);
  }

  deleteBooking(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(getApiUrl(API_ENDPOINTS.ADMIN_BOOKINGS.DELETE(id)));
  }

  getTodayBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(getApiUrl(API_ENDPOINTS.ADMIN_BOOKINGS.GET_TODAY));
  }

  getBookingAnalysis(): Observable<AdminBookingAnalysis> {
    return this.http.get<AdminBookingAnalysis>(getApiUrl(API_ENDPOINTS.ADMIN_BOOKINGS.GET_ANALYSIS));
  }
}
