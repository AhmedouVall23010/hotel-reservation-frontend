export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type BookingRoom = {
  readonly id: number;
  readonly roomNumber: number;
  readonly type: string;
  readonly price: number;
  readonly available: boolean;
  readonly description: string;
  readonly imageUrl: string;
};

export type Booking = {
  readonly id: number;
  readonly user: null;
  readonly room: BookingRoom;
  readonly startDate: string;
  readonly endDate: string;
  readonly totalPrice: number;
  readonly status: BookingStatus;
};

export type ClientAddBookingRequest = {
  readonly userId: number;
  readonly roomId: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly totalPrice?: number; // Optional for booking calculation
};

export type ClientChangeBookingStatusRequest = {
  readonly status: BookingStatus;
};

export type ReceptionBookingsStatusRequest = {
  readonly status: BookingStatus;
};