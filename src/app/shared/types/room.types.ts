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