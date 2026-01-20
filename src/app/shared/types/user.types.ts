import { UserRole } from '../../core/constants/api.constants';

export type User = {
  readonly id: number;
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly role: UserRole;
};

export type UserWithAuthorities = {
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly authorities: Array<{ readonly authority: string }>;
};

export type RegisterRequest = {
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly password: string;
};

export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

export type RegisterResponse = {
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly role: UserRole;
};

export type LoginResponse = {
  readonly token: string;
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly role: UserRole;
};

export type AdminAddUserRequest = {
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
};

export type AdminUpdateUserRequest = {
  readonly nom?: string;
  readonly prenom?: string;
  readonly email?: string;
  readonly password?: string;
  readonly role?: UserRole;
};

export type ErrorResponse = {
  readonly success: false;
  readonly message: string;
  readonly timestamp: string;
};

export type ValidationErrorResponse = {
  readonly error: string;
  readonly details: Record<string, string>;
};