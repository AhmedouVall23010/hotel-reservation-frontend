import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    TEST: '/auth/test',
  },
  ROOMS: {
    GET_ALL: '/rooms',
    GET_DATES_RESERVED: (roomId: number) => `/rooms/dates-reserved/${roomId}`,
  },
  CLIENT: {
    GET_ALL_BOOKINGS: '/client/get-all-bookings',
    ADD_BOOKING: '/client/add-booking',
    CHANGE_BOOKING_STATUS: (bookingId: number) => `/client/change-booking-status/${bookingId}`,
  },
  RECEPTION: {
    ROOMS_AVAILABLE: '/reseption/rooms-available',
    ROOMS_RESERVED: '/reseption/rooms-reserved',
    BOOKINGS_STATUS: '/reseption/bookings-status',
  },
  ADMIN_USERS: {
    GET_ALL: '/admin/users',
    GET_ME: '/admin/users/me',
    ADD: '/admin/users/add',
    UPDATE: (id: number) => `/admin/users/update/${id}`,
    DELETE: (id: number) => `/admin/users/delete/${id}`,
  },
  ADMIN_ROOMS: {
    GET_ALL: '/admin/rooms',
    ADD: '/admin/rooms/add',
    UPDATE: (id: number) => `/admin/rooms/update/${id}`,
    DELETE: (id: number) => `/admin/rooms/delete/${id}`,
    CHANGE_STATUS: (id: number) => `/admin/rooms/change-status/${id}`,
  },
} as const;

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  RECEPTION = 'RESEPTION',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${environment.apiUrl}${environment.apiVersion}${endpoint}`;
};