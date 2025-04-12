
export type UserRole = "admin" | "cashier" | "helper" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional because users from Google auth won't have a password
  role: UserRole;
  active: boolean;
  createdDate: Date;
  photoURL?: string; // Store base64 image or URL from Google
  lastLogin?: Date;
}
