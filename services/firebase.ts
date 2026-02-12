import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  DocumentData,
  QueryConstraint,
  setDoc,
  getDoc,
  Firestore
} from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config';
import { User, Notification, Conversation, Announcement, Testimonial, ApprovalRequest, Referral } from '../types';

// Initialize Firebase
console.log('🔥 Initializing Firebase with config...');
const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Initialize Firestore with multi-tab IndexedDB persistence
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

console.log('✅ Firebase initialized successfully');
console.log('🔐 Auth instance:', auth ? 'Ready' : 'Failed');
console.log('💾 Firestore instance:', db ? 'Ready' : 'Failed');

// ===== HELPER FUNCTIONS =====

// Retry helper for Firestore operations with exponential backoff
const retryFirestoreOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message?.toLowerCase() || '';
      
      // If it's an offline error and we have retries left, wait and retry
      if (
        errorMsg.includes('offline') ||
        errorMsg.includes('unavailable') ||
        errorMsg.includes('network')
      ) {
        if (i < maxRetries - 1) {
          const waitTime = delayMs * Math.pow(2, i); // Exponential backoff
          console.log(`⏳ Firestore unavailable, retrying in ${waitTime}ms... (attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // For non-offline errors, fail immediately
      throw error;
    }
  }
  throw lastError;
};

// ===== AUTHENTICATION FUNCTIONS =====

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    console.log('📝 registerUser called with:', { email, name });
    
    // Validate Firebase is initialized
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    if (!db) {
      throw new Error('Firebase Firestore is not initialized');
    }
    
    console.log('✅ Firebase is initialized');
    
    // Create Firebase auth user
    console.log('🔐 Creating auth user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('✅ Auth user created:', firebaseUser.uid);

    // Create Firestore user document
    const newUser: User = {
      id: firebaseUser.uid,
      name,
      email,
      totalSpent: 0,
      lifetimeSpent: 0,
      referralCount: 0,
      isVip: false
    };

    console.log('💾 Creating Firestore document...');
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    console.log('✅ User registered successfully:', newUser);
    return newUser;
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    const errorMessage = error?.message || error?.code || 'Registration failed';
    throw new Error(errorMessage);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    console.log('🔑 loginUser called with email:', email);
    
    // Validate Firebase is initialized
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    if (!db) {
      throw new Error('Firebase Firestore is not initialized');
    }
    
    console.log('🔐 Signing in with email and password...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('✅ Auth successful, uid:', firebaseUser.uid);

    // Fetch user data from Firestore with retry logic
    console.log('📋 Fetching user profile from Firestore...');
    try {
      const userDoc = await retryFirestoreOperation(() => 
        getDoc(doc(db, 'users', firebaseUser.uid))
      );
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log('✅ User profile retrieved:', userData);
        return userData;
      }
      console.log('⚠️ User document not found in Firestore, creating minimal profile...');
    } catch (firestoreError: any) {
      console.warn('⚠️ Firestore error (continuing with minimal profile):', firestoreError?.message);
    }
    
    // Fallback: Create a minimal user profile if Firestore fetch fails
    console.log('📝 Creating minimal user profile...');
    const minimalUser: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0],
      email: firebaseUser.email || email,
      totalSpent: 0,
      lifetimeSpent: 0,
      referralCount: 0,
      isVip: false
    };
    console.log('✅ Minimal user profile created, user can now log in');
    return minimalUser;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    const errorMessage = error?.message || error?.code || 'Login failed';
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await retryFirestoreOperation(() => 
      getDoc(doc(db, 'users', userId))
    );
    return userDoc.exists() ? (userDoc.data() as User) : null;
  } catch (error: any) {
    // Handle Firestore offline/network errors gracefully so auth isn't blocked
    const msg = error?.message || error?.code || '';
    if (msg.toLowerCase().includes('client is offline') || msg.toLowerCase().includes('offline') || msg === 'unavailable') {
      console.warn('Firestore offline while fetching user profile; returning null (will use fallback profile):', msg);
      return null;
    }
    console.error('Error fetching user:', error);
    return null;
  }
};

// ===== USER OPERATIONS =====

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as User);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// ===== NOTIFICATIONS =====

export const addNotification = async (notification: Omit<Notification, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return { id: docRef.id, ...notification };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add notification');
  }
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'notifications'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// ===== ANNOUNCEMENTS =====

export const addAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), announcement);
    return { id: docRef.id, ...announcement };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add announcement');
  }
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'announcements'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const updateAnnouncement = async (announcementId: string, updates: Partial<Announcement>) => {
  try {
    await updateDoc(doc(db, 'announcements', announcementId), updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update announcement');
  }
};

// ===== TESTIMONIALS =====

export const addTestimonial = async (testimonial: Omit<Testimonial, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'testimonials'), testimonial);
    return { id: docRef.id, ...testimonial };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add testimonial');
  }
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'testimonials'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

export const updateTestimonial = async (testimonialId: string, updates: Partial<Testimonial>) => {
  try {
    await updateDoc(doc(db, 'testimonials', testimonialId), updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update testimonial');
  }
};

// ===== APPROVAL REQUESTS =====

export const addApprovalRequest = async (request: Omit<ApprovalRequest, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'approvalRequests'), request);
    return { id: docRef.id, ...request };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit approval request');
  }
};

export const getApprovalRequests = async (): Promise<ApprovalRequest[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'approvalRequests'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApprovalRequest));
  } catch (error: any) {
    console.error('Error fetching approval requests:', error);
    return [];
  }
};

export const updateApprovalRequest = async (requestId: string, status: 'approved' | 'rejected') => {
  try {
    await updateDoc(doc(db, 'approvalRequests', requestId), { status });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update approval request');
  }
};

// ===== REFERRALS =====

export const addReferral = async (referral: Omit<Referral, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'referrals'), referral);
    return { id: docRef.id, ...referral };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add referral');
  }
};

export const getReferrals = async (): Promise<Referral[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'referrals'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Referral));
  } catch (error: any) {
    console.error('Error fetching referrals:', error);
    return [];
  }
};

// ===== CONVERSATIONS =====

export const addConversation = async (conversation: Omit<Conversation, 'unreadCount'>) => {
  try {
    const docRef = await addDoc(collection(db, 'conversations'), { ...conversation, unreadCount: 0 });
    return { id: docRef.id, unreadCount: 0, ...conversation };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add conversation');
  }
};

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'conversations'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Conversation));
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update conversation');
  }
};
