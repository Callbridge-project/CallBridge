import { Client, Databases } from 'appwrite';

// 1. Initialize the Appwrite Client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) 
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);        

// 2. Export the services you need so other files can import them

export const databases = new Databases(client);

export default client;
