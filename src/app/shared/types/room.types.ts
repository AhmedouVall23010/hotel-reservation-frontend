export type Room = {
  readonly id: number;
  readonly roomNumber: number;
  readonly type: string;
  readonly price: number;
  readonly available: boolean;
  readonly description: string;
  readonly imageUrl: string;
};

export type AdminAddRoomRequest = {
  readonly roomNumber: number;
  readonly description: string;
  readonly type: string;
  readonly price: number;
  readonly image: File;
};

export type AdminUpdateRoomRequest = {
  readonly roomNumber?: number;
  readonly description?: string;
  readonly type?: string;
  readonly price?: number;
  readonly image?: File;
};

export type RoomChangeStatusResponse = {
  readonly message: string;
  readonly room: Room;
};

export type RoomUpdateResponse = {
  readonly message: string;
  readonly room: Room;
};

export type RoomDeleteResponse = {
  readonly message: string;
};

export type ReservedDate = {
  readonly startDate: string;
  readonly endDate: string;
};

// Response type for dates-reserved endpoint
export type ReservedDatesResponse = {
  readonly roomId: number;
  readonly dates: string[];
  readonly message?: string;
};

// Extended room type with reserved dates (for caching)
export type RoomWithReservedDates = Room & {
  readonly reservedDates?: string[];
};

// Date range type for validation
export type DateRange = {
  readonly startDate: string;
  readonly endDate: string;
};