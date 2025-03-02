
export type UserRole = "admin" | "cashier" | "helper";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional because users from Google auth won't have a password
  role: UserRole;
  active: boolean;
  createdAt: Date;
  photoURL?: string;
  lastLogin?: Date;
}
