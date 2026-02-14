export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type BookingUser = {
  readonly id: number;
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly role: string;
};

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
  readonly user: BookingUser | null;
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

export type ReceptionAddBookingRequest = {
  readonly userId: number;
  readonly roomId: number;
  readonly startDate: string;
  readonly endDate: string;
};

export type ReceptionUpdateBookingRequest = {
  readonly status?: BookingStatus;
  readonly startDate?: string;
  readonly endDate?: string;
};

export type ReceptionChangeStatusRequest = {
  readonly status: BookingStatus;
};

export type ReceptionUpdateBookingResponse = {
  readonly message: string;
  readonly booking: Booking;
};

export type ReceptionChangeStatusResponse = {
  readonly message: string;
  readonly booking: Booking;
};

export type AdminAddBookingRequest = {
  readonly userId: number;
  readonly roomId: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly status?: BookingStatus;
};

export type AdminUpdateBookingRequest = {
  readonly status?: BookingStatus;
  readonly startDate?: string;
  readonly endDate?: string;
};

export type AdminUpdateBookingResponse = {
  readonly message: string;
  readonly booking: Booking;
};

export type AdminBookingAnalysis = {
  readonly totalUsers: number;
  readonly totalRooms: number;
  readonly reservedRooms: number;
  readonly totalBookings: number;
};