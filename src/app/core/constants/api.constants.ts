import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    TEST: '/auth/test',
  },
  // Public endpoints (no auth required)
  PUBLIC: {
    ROOMS: {
      GET_ALL: '/rooms',
      GET_DATES_RESERVED: (roomId: number) => `/rooms/dates-reserved/${roomId}`,
      GET_DETAILS: (roomId: number) => `/rooms/${roomId}`,
    },
  },
  CLIENT: {
    GET_ALL_BOOKINGS: '/client/get-all-bookings',
    ADD_BOOKING: '/client/add-booking',
    CHANGE_BOOKING_STATUS: (bookingId: number) => `/client/change-booking-status/${bookingId}`,
  },
  RECEPTION: {
    ROOMS_AVAILABLE: '/reseption/rooms-available',
    ROOMS_RESERVED: '/reseption/rooms-reserved',
    BOOKINGS_ACTIVE: '/reseption/bookings/active',
    BOOKINGS_ADD: '/reseption/bookings/add',
    BOOKINGS_UPDATE: (id: number) => `/reseption/bookings/update/${id}`,
    BOOKINGS_CHANGE_STATUS: (id: number) => `/reseption/bookings/change-status/${id}`,
    BOOKINGS_DELETE: (id: number) => `/reseption/bookings/delete/${id}`,
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
  ADMIN_BOOKINGS: {
    GET_ALL: '/admin/bookings',
    GET_BY_ID: (id: number) => `/admin/bookings/${id}`,
    ADD: '/admin/bookings/add',
    UPDATE: (id: number) => `/admin/bookings/update/${id}`,
    DELETE: (id: number) => `/admin/bookings/delete/${id}`,
    GET_TODAY: '/admin/bookings/today',
    GET_ANALYSIS: '/admin/bookings/analysis',
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