import { Client, Account, Databases } from "appwrite";
import { mockDatabases } from "./mockDatabase";

// List of required environment variables for validation
const requiredEnvVars = {
  VITE_APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  VITE_APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
  VITE_APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  VITE_APPWRITE_USERS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
  VITE_APPWRITE_CALL_LOGS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_CALL_LOGS_COLLECTION_ID,
  VITE_APPWRITE_SMS_LOGS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_SMS_LOGS_COLLECTION_ID,
  VITE_APPWRITE_DEVICES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_DEVICES_COLLECTION_ID,
  VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID,
  VITE_APPWRITE_SUPPORT_TICKETS_COLLECTION_ID: import.meta.env.VITE_APPWRITE_SUPPORT_TICKETS_COLLECTION_ID,
};

// Error handling: Validate environment variables on startup in development mode.
// Skipped when VITE_USE_MOCK_DATA=true so the app runs without Appwrite credentials.
const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === "true";

if (import.meta.env.DEV && !isMockMode) {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Appwrite environment variables: ${missing.join(", ")}. Please verify your .env file.`
    );
  }
}

// Typed configuration object
export interface AppwriteConfigType {
  projectId: string;
  endpoint: string;
  databaseId: string;
  collections: {
    users: string;
    callLogs: string;
    smsLogs: string;
    devices: string;
    activityLogs: string;
    supportTickets: string;
  };
}

export const AppwriteConfig: AppwriteConfigType = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || "",
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || "",
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "",
  collections: {
    users: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || "",
    callLogs: import.meta.env.VITE_APPWRITE_CALL_LOGS_COLLECTION_ID || "",
    smsLogs: import.meta.env.VITE_APPWRITE_SMS_LOGS_COLLECTION_ID || "",
    devices: import.meta.env.VITE_APPWRITE_DEVICES_COLLECTION_ID || "",
    activityLogs: import.meta.env.VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID || "",
    supportTickets: import.meta.env.VITE_APPWRITE_SUPPORT_TICKETS_COLLECTION_ID || "",
  },
};

// Initialize Appwrite client singleton
export const client = new Client()
  .setEndpoint(AppwriteConfig.endpoint)
  .setProject(AppwriteConfig.projectId);

// Export instances of Appwrite services
const realAccount = new Account(client);

// Mock account — simulates Appwrite Account API surface for Settings / Auth
const mockAccount = {
  get: () => Promise.resolve({}),
  createEmailPasswordSession: (_email: string, _password: string) =>
    new Promise((res) => setTimeout(() => res({ $id: "mock_session" }), 600)),
  deleteSession: () => new Promise((res) => setTimeout(res, 400)),
  create: (userId: string, email: string, password: string, name?: string) =>
    new Promise((res) => setTimeout(() => res({ $id: userId, email, name, registration: new Date().toISOString() }), 600)),
  updateName: (name: string) =>
    new Promise<void>((res) => setTimeout(() => { console.log("[MockAccount] updateName:", name); res(); }, 500)),
  updatePassword: (newPass: string, _oldPass: string) =>
    new Promise<void>((res) => setTimeout(() => { console.log("[MockAccount] updatePassword called"); res(); }, 500)),
} as unknown as Account;

export const account = isMockMode ? mockAccount : realAccount;

// ─── Mock mode interception ───────────────────────────────────────────────────
// When VITE_USE_MOCK_DATA=true, `databases` is the mock object (mockDatabase.ts)
// which serves fixture data instead of hitting Appwrite.
// To remove mock mode: delete mockData.ts + mockDatabase.ts, revert these lines.
export const databases = isMockMode
  ? (mockDatabases as unknown as Databases)
  : new Databases(client);

// Export database and collection ID constants
export const APPWRITE_DATABASE_ID = AppwriteConfig.databaseId;
export const USERS_COLLECTION_ID = AppwriteConfig.collections.users;
export const CALL_LOGS_COLLECTION_ID = AppwriteConfig.collections.callLogs;
export const SMS_LOGS_COLLECTION_ID = AppwriteConfig.collections.smsLogs;
export const DEVICES_COLLECTION_ID = AppwriteConfig.collections.devices;
export const ACTIVITY_LOGS_COLLECTION_ID = AppwriteConfig.collections.activityLogs;
export const SUPPORT_TICKETS_COLLECTION_ID = AppwriteConfig.collections.supportTickets;
