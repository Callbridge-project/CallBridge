import { Client, Databases, Account } from 'appwrite';

// 1. Initialize the Appwrite Client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) 
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);        

// 2. Export the services you need so other files can import them
export const databases = new Databases(client);
export const account = new Account(client);

// 3. Export Environment Variables configuration constants
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const APPWRITE_USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

export default client;

