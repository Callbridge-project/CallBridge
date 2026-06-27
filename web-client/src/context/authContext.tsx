import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, databases, APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID } from '../appwrite/config';
import { ID } from 'appwrite';
import type { Models } from 'appwrite';
import type { UserDocument, AuthContextType } from '../types/index';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountState, setAccountState] = useState<Models.User<Models.Preferences> | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

 // Sync auth state on mount
useEffect(() => {
  const initializeAuth = async () => {
    try {
      // 1. Try getting the active account session
      const currentAccount = await account.get();
      setAccountState(currentAccount);

      // 2. Fetch corresponding document from users collection
      if (currentAccount && APPWRITE_DATABASE_ID && APPWRITE_USERS_COLLECTION_ID) {
        try {
          const document = await databases.getDocument<UserDocument>(
            APPWRITE_DATABASE_ID,
            APPWRITE_USERS_COLLECTION_ID,
            currentAccount.$id
          );
          setUserDoc(document);
        } catch (docErr: any) {
          // SELF-HEALING: Session exists, but Database Profile Document is missing (404)!
          console.warn("Session active, but profile document missing. Cleaning orphan session...", docErr.message);
          
          // Clear the orphaned server cookie to completely resolve the 401 session block
          await account.deleteSession('current');
          setAccountState(null);
          setUserDoc(null);
        }
      }
    } catch (err: any) {
      console.warn('No active session exists:', err.message);
      setAccountState(null);
      setUserDoc(null);
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);
  const login = async (email: string, password: string, rememberMe: boolean) => {
  setLoading(true);
  setError(null);
  try {
    // 1. Check for and clear any existing active session first
    try {
      const currentSession = await account.get();
      if (currentSession) {
        // Active session found! Clear it to avoid the session collision error
        await account.deleteSession('current');
      }
    } catch {
      // If account.get() throws an error, it means no active session exists.
      // We can safely ignore this catch and proceed with login.
    }

    // 2. Create the new session cleanly
    await account.createEmailPasswordSession(email, password);

    // 3. Fetch the user details
    const currentAccount = await account.get();
    setAccountState(currentAccount);

    // 4. Update the last_login timestamp and fetch the user document
    const nowStr = new Date().toISOString();
    let document: UserDocument;

    try {
      document = await databases.updateDocument<UserDocument>(
        APPWRITE_DATABASE_ID,
        APPWRITE_USERS_COLLECTION_ID,
        currentAccount.$id,
        { last_login: nowStr }
      );
    } catch (docErr) {
      console.warn('User document not found on login. Creating new document...', docErr);
      document = await databases.createDocument<UserDocument>(
        APPWRITE_DATABASE_ID,
        APPWRITE_USERS_COLLECTION_ID,
        currentAccount.$id,
        {
          full_name: currentAccount.name || 'CallBridge User',
          email: currentAccount.email,
          created_at: nowStr,
          last_login: nowStr,
          active_device_name: null,
          active_device_id: null
        }
      );
    }
    
    setUserDoc(document);

    // 5. Handle "Remember Me" email pre-fill
    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }
  } catch (err: any) {
    setError(err.message || 'Failed to sign in. Please check your credentials.');
    throw err;
  } finally {
    setLoading(false);
  }
};
  const register = async (fullName: string, email: string, password: string, activeDeviceName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userId = ID.unique();
      
      // 1. Create the Appwrite Auth Account
      await account.create(userId, email, password, fullName);

      // 2. Create session immediately
      await account.createEmailPasswordSession(email, password);

      // Fetch user account to ensure state is synchronized
      const currentAccount = await account.get();
      setAccountState(currentAccount);

      // 3. Sync and create document in the databases Users collection
      const nowStr = new Date().toISOString();
      const deviceId = activeDeviceName ? `dev_${Math.random().toString(36).substring(2, 10)}` : null;

      const document = await databases.createDocument<UserDocument>(
        APPWRITE_DATABASE_ID,
        APPWRITE_USERS_COLLECTION_ID,
        currentAccount.$id, // Use newly generated User ID as the document ID
        {
          full_name: fullName,
          email: email,
          created_at: nowStr,
          last_login: nowStr,
          active_device_name: activeDeviceName || null,
          active_device_id: deviceId
        }
      );

      setUserDoc(document);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await account.deleteSession('current');
    } catch (err: any) {
      console.error('Appwrite logout failed:', err.message);
    } finally {
      // Clear local application state regardless of session termination success
      setAccountState(null);
      setUserDoc(null);
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: userDoc,
        account: accountState,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
