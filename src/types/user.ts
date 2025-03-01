
export type UserRole = "admin" | "cashier" | "helper";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Note: In a real app, this would be hashed and stored securely
  role: UserRole;
  active: boolean;
  createdAt: Date;
  photoURL?: string;
}
