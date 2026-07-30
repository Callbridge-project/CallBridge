import { Account, ID, Permission, Role } from 'appwrite';
import type { Models } from 'appwrite';
import { account, databases } from '@/lib/appwrite';

// SIGN UP — creates a new user account
export const signUp = async (
    fullName: string,
    email: string,
    password: string
): Promise<{ success: boolean; data?: Models.User<Models.Preferences>; error?: string }> => {
    try {
        const user = await account.create(
            ID.unique(),
            email,
            password,
            fullName
        );

        await databases.createDocument(
    import.meta.env.VITE_APPWRITE_DATABASE_ID,
    import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    user.$id,
    {
        user_id: user.$id,
        full_name: fullName,
        email: email,
        created_at: new Date().toISOString()
    },
    [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
    ]
);

        return { success: true, data: user };
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return { success: false, error: message };
}
};

// LOGIN — authenticates an existing user
export const login = async (
    email: string,
    password: string
): Promise<{ success: boolean; data?: Models.Session; error?: string }> => {
    try {
        const session = await account.createEmailPasswordSession(
            email,
            password
        );
        return { success: true, data: session };
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return { success: false, error: message };
}
};


// GET CURRENT USER — returns logged in user or null
export const getCurrentUser = async (): Promise<{
    success: boolean;
    data?: Models.User<Models.Preferences>;
    error?: null;
}> => {
    try {
        const user = await account.get();
        return { success: true, data: user };
    } catch {
    return { success: false, error: null };
}
};

// LOGOUT — ends the current session
export const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        await account.deleteSession('current');
        return { success: true };
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return { success: false, error: message };
}
};