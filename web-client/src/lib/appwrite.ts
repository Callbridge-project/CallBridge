import { Client, Account, Databases } from "appwrite";

// ── Appwrite Configuration ────────────────────────────────────────
export interface AppwriteConfigType {
    projectId: string;
    projectName: string;
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
    projectName: import.meta.env.VITE_APPWRITE_PROJECT_NAME || "",
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

// ── Initialize Appwrite Client ────────────────────────────────────
export const client = new Client()
    .setEndpoint(AppwriteConfig.endpoint)
    .setProject(AppwriteConfig.projectId);

// ── Export Service Instances ──────────────────────────────────────
export const account = new Account(client);
export const databases = new Databases(client);

// ── Collection ID Constants ───────────────────────────────────────
export const APPWRITE_DATABASE_ID = AppwriteConfig.databaseId;
export const USERS_COLLECTION_ID = AppwriteConfig.collections.users;
export const CALL_LOGS_COLLECTION_ID = AppwriteConfig.collections.callLogs;
export const SMS_LOGS_COLLECTION_ID = AppwriteConfig.collections.smsLogs;
export const DEVICES_COLLECTION_ID = AppwriteConfig.collections.devices;
export const ACTIVITY_LOGS_COLLECTION_ID = AppwriteConfig.collections.activityLogs;
export const SUPPORT_TICKETS_COLLECTION_ID = AppwriteConfig.collections.supportTickets;