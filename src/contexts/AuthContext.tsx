import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  uploadProduct?: (product: any) => Promise<void>; // Optional, only for admin
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded admin credentials
  const ADMIN_EMAIL = 'admin@igovu.com';
  const ADMIN_PASSWORD = 'adminpassword123'; // Change as needed

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    // Allow anyone except admin to sign up as buyer
    if (email === ADMIN_EMAIL) {
      // Admin signup: create user and set role in Firestore
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const db = getFirestore(app);
      await addDoc(collection(db, 'roles'), {
        uid: userCredential.user.uid,
        role: 'admin',
        email: email
      });
      return;
    }
    // Buyer signup
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const db = getFirestore(app);
    await addDoc(collection(db, 'roles'), {
      uid: userCredential.user.uid,
      role: 'buyer',
      email: email
    });
  };

  const login = async (email: string, password: string) => {
    // Admin login with hardcoded credentials
    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        throw new Error('Invalid admin credentials.');
      }
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
    // Buyer login (anyone else)
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Product upload logic for admin
  const uploadProduct = async (product: any) => {
    if (!isAdmin) throw new Error('Only admin can upload products.');
    const db = getFirestore(app);
    await addDoc(collection(db, 'products'), product);
  };

  const value = {
    currentUser,
    isAdmin,
    login,
    signup,
    logout,
    uploadProduct: isAdmin ? uploadProduct : undefined
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};