import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [googleAccessToken, setGoogleAccessToken] = useState(null);

    const googleProvider = new GoogleAuthProvider();
    // Request access to Google Calendar
    googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

    const signIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Extract the Google OAuth access token
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                setGoogleAccessToken(credential.accessToken);
                localStorage.setItem('gcal_access_token', credential.accessToken);
            }
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setGoogleAccessToken(null);
            localStorage.removeItem('gcal_access_token');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    /**
     * Re-authenticate to get a fresh Google access token.
     * Called when the stored token expires (tokens last ~1 hour).
     */
    const refreshGoogleToken = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                setGoogleAccessToken(credential.accessToken);
                localStorage.setItem('gcal_access_token', credential.accessToken);
                return credential.accessToken;
            }
        } catch (error) {
            console.error("Error refreshing Google token:", error);
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Restore token from localStorage on page reload
            if (currentUser) {
                const storedToken = localStorage.getItem('gcal_access_token');
                if (storedToken) {
                    setGoogleAccessToken(storedToken);
                }
            } else {
                setGoogleAccessToken(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            logout,
            googleAccessToken,
            refreshGoogleToken
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
