import type { Models } from 'appwrite';

/**
 * Represents the document structure in the Appwrite Users collection.
 */
export interface UserDocument extends Models.Document {
  full_name: string;
  email: string;
  created_at: string; // ISO 8601 string
  last_login: string | null; // ISO 8601 string
  active_device_name?: string | null;
  active_device_id?: string | null;
}

/**
 * Interface for the AuthContext value.
 */
export interface AuthContextType {
  user: UserDocument | null;
  account: Models.User<Models.Preferences> | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string, activeDeviceName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}