import { databases } from './config';
import { Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const CALL_LOGS_ID = import.meta.env.VITE_APPWRITE_CALL_LOGS_COLLECTION_ID;
const SMS_LOGS_ID = import.meta.env.VITE_APPWRITE_SMS_LOGS_COLLECTION_ID;
const ACTIVITY_LOGS_ID = import.meta.env.VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID;

// Deletes all documents for a user from one collection
const clearCollection = async (collectionId: string, userId: string): Promise<number> => {
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await databases.listDocuments(
            DATABASE_ID,
            collectionId,
            [
                Query.equal('user_id', userId),
                Query.limit(100)
            ]
        );

        if (response.documents.length === 0) {
            hasMore = false;
            break;
        }

        // Delete all fetched documents in parallel
        await Promise.all(
            response.documents.map(doc =>
                databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
            )
        );

        totalDeleted += response.documents.length;

        // If we got less than 100 there are no more pages
        if (response.documents.length < 100) hasMore = false;
    }

    return totalDeleted;
};

// Main function — clears all three collections for the user
export const clearAllUserData = async (
    userId: string,
    onProgress?: (message: string) => void
): Promise<void> => {
    onProgress?.('Clearing call logs...');
    const callsDeleted = await clearCollection(CALL_LOGS_ID, userId);

    onProgress?.('Clearing SMS logs...');
    const smsDeleted = await clearCollection(SMS_LOGS_ID, userId);

    onProgress?.('Clearing activity logs...');
    const activityDeleted = await clearCollection(ACTIVITY_LOGS_ID, userId);

    console.log(
        `DataService: cleared ${callsDeleted} call logs, ${smsDeleted} SMS logs, ${activityDeleted} activity logs`
    );
};