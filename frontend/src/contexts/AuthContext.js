import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';

// Create the auth context
const AuthContext = createContext();

// Define the list of admin emails (in a production app, this should be stored in Firestore or a custom claim)
const ADMIN_EMAILS = [
  'admin@example.com',
  'admin@isabellaeichleronus.com'
  // Add other admin emails here
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is an admin based on email
  const checkAdminStatus = (user) => {
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdmin(checkAdminStatus(user));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export the hook for easy context consumption
export const useAuth = () => useContext(AuthContext);