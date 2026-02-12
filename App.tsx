
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Notification, ApprovalRequest, Referral, Announcement, Testimonial, ChatMessage, Conversation, Comment } from './types';
import ClientDashboard from './components/ClientDashboard';
import AdminPortal from './components/AdminPortal';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import { Logo, GoldButton } from './components/CommonUI';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { SPENDING_THRESHOLD, BONUS_AMOUNT, VIP_SUBSCRIPTION_FEE } from './constants';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getNotifications,
  getAnnouncements,
  getTestimonials,
  getApprovalRequests,
  getReferrals,
  getConversations,
  addNotification,
  addAnnouncement,
  addApprovalRequest,
  addReferral,
  updateAnnouncement,
  updateApprovalRequest,
  addTestimonial,
  updateTestimonial,
  addConversation,
  updateConversation
} from './services/firebase';
import { auth } from './services/firebase';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalView, setLoginModalView] = useState<'login' | 'signup'>('login');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'premium' | 'dark-stealth'>('premium');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check Firebase authentication state and load user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setCurrentUser(userProfile);
            setIsLoggedIn(true);
          }
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load Firestore data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [notifs, anns, testims, reqs, refs, convs, users] = await Promise.all([
          getNotifications(),
          getAnnouncements(),
          getTestimonials(),
          getApprovalRequests(),
          getReferrals(),
          getConversations(),
          getAllUsers()
        ]);
        
        setNotifications(notifs.length > 0 ? notifs : [{ id: 'n1', title: 'Welcome!', message: 'Join our VIP for unlimited linings and priority booking.', timestamp: '2h ago' }]);
        setAnnouncements(anns.length > 0 ? anns : [
          { 
            id: 'a1', 
            title: 'Sunday Soirée', 
            description: 'Exclusive after-hours cuts with live jazz. Reservations only.', 
            date: 'Sun, Dec 22', 
            type: 'event',
            likes: 8,
            likedBy: [],
            comments: []
          }
        ]);
        setTestimonials(testims.length > 0 ? testims : []);
        setRequests(reqs);
        setReferrals(refs);
        setConversations(convs.length > 0 ? convs : []);
        setAllUsers(users.length > 0 ? users : []);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'premium' ? 'dark-stealth' : 'premium');
  };

  const [allUsers, setAllUsers] = useState<User[]>([
    { id: 'u1', name: 'Timi Salami', email: 'timi@example.com', totalSpent: 3500, lifetimeSpent: 13500, referralCount: 1, isVip: false },
    { 
      id: 'u2', 
      name: 'James Doe', 
      email: 'james@example.com', 
      totalSpent: 4800, 
      lifetimeSpent: 24800, 
      referralCount: 0, 
      isVip: true,
      vipExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() 
    },
    { id: 'u3', name: 'Bayo Richards', email: 'bayo@example.com', totalSpent: 1200, lifetimeSpent: 1200, referralCount: 2, isVip: false }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'Welcome!', message: 'Join our VIP for unlimited linings and priority booking.', timestamp: '2h ago' }
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      userId: 'u1', 
      userName: 'Timi Salami', 
      lastMessage: 'I sent my referral!', 
      timestamp: '10m ago', 
      unreadCount: 1,
      messages: [
        { id: 'm1', senderId: 'u1', senderName: 'Timi Salami', text: 'Hey, I referred my friend Tunji. Has he finished his cut yet?', timestamp: '1h ago' },
        { id: 'm2', senderId: 'admin', senderName: 'Manager', text: 'Checking now, Timi!', timestamp: '50m ago' },
        { id: 'm3', senderId: 'u1', senderName: 'Timi Salami', text: 'I sent my referral!', timestamp: '10m ago' }
      ]
    }
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { 
      id: 'a1', 
      title: 'Sunday Soirée', 
      description: 'Exclusive after-hours cuts with live jazz. Reservations only.', 
      date: 'Sun, Dec 22', 
      type: 'event',
      likes: 8,
      likedBy: [],
      comments: []
    },
    { 
      id: 'a2', 
      title: 'Loyalty Week', 
      description: 'Double progress toward the N500 bonus all week!', 
      date: 'Ends Monday', 
      type: 'deal',
      likes: 15,
      likedBy: [],
      comments: [{ id: 'ca1', userId: 'u1', userName: 'Timi Salami', text: 'This is huge! N500 bonus is almost mine.', timestamp: '2h ago' }]
    }
  ]);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    { 
      id: 't1', 
      userId: 'u2',
      userName: 'James Doe', 
      userImage: undefined,
      content: 'The Signature Fade is out of this world. Best barber in Lagos!', 
      rating: 5, 
      date: '2 days ago',
      likes: 12,
      likedBy: [],
      comments: [
        { id: 'c1', userId: 'u1', userName: 'Timi Salami', text: 'Looking fresh bro!', timestamp: '1 day ago' }
      ]
    }
  ]);

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    // Save to Firebase
    try {
      await updateUserProfile(currentUser.id, updatedData);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleLikeTestimonial = (testimonialId: string) => {
    if (!currentUser) return;
    setTestimonials(prev => prev.map(t => {
      if (t.id === testimonialId) {
        const alreadyLiked = t.likedBy.includes(currentUser.id);
        if (alreadyLiked) {
          return { ...t, likes: t.likes - 1, likedBy: t.likedBy.filter(id => id !== currentUser.id) };
        } else {
          return { ...t, likes: t.likes + 1, likedBy: [...t.likedBy, currentUser.id] };
        }
      }
      return t;
    }));
  };

  const handleLikeAnnouncement = (announcementId: string) => {
    if (!currentUser) return;
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const alreadyLiked = a.likedBy.includes(currentUser.id);
        if (alreadyLiked) {
          return { ...a, likes: a.likes - 1, likedBy: a.likedBy.filter(id => id !== currentUser.id) };
        } else {
          return { ...a, likes: a.likes + 1, likedBy: [...a.likedBy, currentUser.id] };
        }
      }
      return a;
    }));
  };

  const handleAddComment = (testimonialId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.profilePicture,
      text,
      timestamp: 'Just now'
    };
    setTestimonials(prev => prev.map(t => {
      if (t.id === testimonialId) {
        return { ...t, comments: [...t.comments, newComment] };
      }
      return t;
    }));
  };

  const handleAddAnnouncementComment = (announcementId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newComment: Comment = {
      id: `ca-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.profilePicture,
      text,
      timestamp: 'Just now'
    };
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        return { ...a, comments: [...a.comments, newComment] };
      }
      return a;
    }));
  };

  const handleAdminSendMessage = async (userId: string, text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: ChatMessage = { id: `m-${Date.now()}`, senderId: 'admin', senderName: 'Manager', text, timestamp };
    const userObj = allUsers.find(u => u.id === userId);

    setConversations(prev => {
      const existing = prev.find(c => c.userId === userId);
      if (existing) {
        const filtered = prev.filter(c => c.userId !== userId);
        return [{ 
          ...existing, 
          lastMessage: text, 
          timestamp, 
          messages: [...existing.messages, newMessage], 
          unreadCount: 0 
        }, ...filtered];
      } else {
        return [{ 
          userId, 
          userName: userObj?.name || 'Client', 
          lastMessage: text, 
          timestamp, 
          unreadCount: 0, 
          messages: [newMessage] 
        }, ...prev];
      }
    });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `You are ${userObj?.name}, a busy high-end client of 'Celebrity Barber'. The manager messaged you: "${text}". Reply briefly in a busy but elite character.` }] },
      });

      const aiText = response.text?.trim() || "Thank you.";
      const aiMsg: ChatMessage = { 
        id: `m-ai-${Date.now()}`, 
        senderId: userId, 
        senderName: userObj?.name || 'Client', 
        text: aiText, 
        timestamp: 'Just now', 
        isAi: true 
      };

      setConversations(prev => prev.map(c => {
        if (c.userId === userId) {
          return { ...c, lastMessage: aiText, timestamp: 'Just now', messages: [...c.messages, aiMsg] };
        }
        return c;
      }));
    } catch (e) {
      console.error("AI Simulated Response Failed", e);
    }
  };

  const handleClientSendMessage = async (text: string) => {
    if (!currentUser) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: ChatMessage = { id: `m-${Date.now()}`, senderId: currentUser.id, senderName: currentUser.name, text, timestamp };
    
    setConversations(prev => {
      const existing = prev.find(c => c.userId === currentUser.id);
      if (existing) {
        const filtered = prev.filter(c => c.userId !== currentUser.id);
        return [{ 
          ...existing, 
          lastMessage: text, 
          timestamp, 
          messages: [...existing.messages, newMessage],
          unreadCount: existing.unreadCount + 1 
        }, ...filtered];
      } else {
        return [{ 
          userId: currentUser.id, 
          userName: currentUser.name, 
          lastMessage: text, 
          timestamp, 
          unreadCount: 1, 
          messages: [newMessage] 
        }, ...prev];
      }
    });

    const adminNotif: Notification = {
      id: `an-${Date.now()}`,
      title: 'Incoming Client Message',
      message: `${currentUser.name}: "${text.substring(0, 40)}..."`,
      timestamp: 'Just now'
    };
    setNotifications(prev => [adminNotif, ...prev]);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `You are 'Celebrity Concierge'. A high-end client named ${currentUser.name} messaged: "${text}". Reply with elite politeness and luxury. Keep it brief.` }] },
      });

      const aiText = response.text?.trim() || "We are attending to your request immediately.";
      const aiMsg: ChatMessage = { 
        id: `m-concierge-${Date.now()}`, 
        senderId: 'concierge', 
        senderName: 'Celebrity Concierge', 
        text: aiText, 
        timestamp: 'Just now',
        isAi: true 
      };

      setConversations(prev => prev.map(c => {
        if (c.userId === currentUser.id) {
          return { ...c, lastMessage: aiText, timestamp: 'Just now', messages: [...c.messages, aiMsg] };
        }
        return c;
      }));
    } catch (e) {
      console.error("Concierge AI Reply Failed", e);
    }
  };

  const handleMarkAsRead = (userId: string) => {
    setConversations(prev => prev.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c));
  };

  const handleLogin = async (email: string, password?: string) => {
    try {
      console.log('🔐 handleLogin called with email:', email);
      if (password) {
        // Try to sign in if password is provided
        console.log('🔑 Attempting Firebase authentication...');
        const user = await loginUser(email, password);
        console.log('✅ Login successful, user:', user);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setView('client');
        setShowLoginModal(false);
        console.log('✅ User navigated to portal');
      } else {
        // Fallback to email-only mode (keep backward compatibility)
        console.log('📧 Fallback mode: searching for user...');
        const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          setCurrentUser(existing);
        } else {
          const newUser: User = {
            id: `u-${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            totalSpent: 0,
            lifetimeSpent: 0,
            referralCount: 0,
            isVip: false
          };
          setAllUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
        }
        setIsLoggedIn(true);
        setView('client');
        setShowLoginModal(false);
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleAdminLogin = (email: string) => {
    setIsAdminLoggedIn(true);
    setShowAdminLoginModal(false);
    setView('admin'); 
  };

  const handleLogout = async () => {
    try {
      if (isLoggedIn) {
        await logoutUser(); // Firebase logout
      }
      setIsLoggedIn(false);
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
      setView('client');
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  };

  const handleReportPayment = async (amount: number, serviceName?: string, comment?: string) => {
    if (!currentUser) return;
    const newReq: ApprovalRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      amount,
      serviceName,
      comment,
      type: 'spending',
      proofOfPayment: `REF-${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };
    setRequests(prev => [newReq, ...prev]);
    
    // Save to Firebase
    try {
      await addApprovalRequest(newReq);
    } catch (error) {
      console.error('Error saving approval request:', error);
    }
  };

  const handleVipSubscription = async (proofRef?: string, proofImg?: string) => {
    if (!currentUser) return;
    const newReq: ApprovalRequest = {
      id: `vip-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      amount: VIP_SUBSCRIPTION_FEE,
      type: 'vip',
      proofOfPayment: proofRef || `VIP-TRF-${Math.floor(Math.random() * 999999)}`,
      proofImage: proofImg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };
    setRequests(prev => [newReq, ...prev]);
    
    // Save to Firebase
    try {
      await addApprovalRequest(newReq);
    } catch (error) {
      console.error('Error saving VIP request:', error);
    }
  };

  const handleAddReferral = async (friendName: string) => {
    if (!currentUser) return;
    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      referrerId: currentUser.id,
      referredName: friendName,
      status: 'pending'
    };
    setReferrals(prev => [newRef, ...prev]);
    
    // Save to Firebase
    try {
      await addReferral(newRef);
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  };

  const handleApprove = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === req.userId) {
        let newTotal = u.totalSpent + req.amount;
        let newLifetime = u.lifetimeSpent + req.amount;
        let newVip = u.isVip;
        let newVipExpiry = u.vipExpiry;

        if (req.type === 'spending') {
          if (newTotal >= SPENDING_THRESHOLD) {
            const bonusNotif: Notification = {
              id: `bonus-${Date.now()}`,
              title: 'N500 Bonus Unlocked!',
              message: `Congratulations! Cycle complete. You've earned an N${BONUS_AMOUNT} credit. Progress refreshed.`,
              timestamp: 'Just now'
            };
            setNotifications(prevNotifs => [bonusNotif, ...prevNotifs]);
            addNotification(bonusNotif).catch(err => console.error('Error saving notification:', err));
            newTotal = newTotal % SPENDING_THRESHOLD;
          }
        } else if (req.type === 'vip') {
          newVip = true;
          newVipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          
          const vipWelcomeNotif: Notification = {
            id: `vip-welcome-${Date.now()}`,
            title: 'Welcome to VIP Elite!',
            message: `Congratulations ${u.name}! Your VIP access is now active. Enjoy priority booking, unlimited linings, and elite concierge access until ${new Date(newVipExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.`,
            timestamp: 'Just now'
          };
          setNotifications(prev => [vipWelcomeNotif, ...prev]);
          addNotification(vipWelcomeNotif).catch(err => console.error('Error saving notification:', err));
        }

        const updatedUser = { ...u, totalSpent: newTotal, lifetimeSpent: newLifetime, isVip: newVip, vipExpiry: newVipExpiry };
        if (currentUser && u.id === currentUser.id) {
          setCurrentUser(updatedUser);
          updateUserProfile(currentUser.id, updatedUser).catch(err => console.error('Error updating user:', err));
        }
        return updatedUser;
      }
      return u;
    }));
    
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
    
    // Update Firebase
    try {
      await updateApprovalRequest(requestId, 'approved');
    } catch (error) {
      console.error('Error updating approval request:', error);
    }
  };

  const handleConfirmReferral = async (referralId: string) => {
    const ref = referrals.find(r => r.id === referralId);
    if (!ref) return;
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === ref.referrerId) {
        let newRefCount = u.referralCount + 1;
        
        if (newRefCount >= 3) {
          const rewardNotif: Notification = {
            id: `reward-${Date.now()}`,
            title: 'FREE CUT UNLOCKED!',
            message: `You've referred 3 friends! Enjoy your free session. Counter refreshed.`,
            timestamp: 'Just now'
          };
          setNotifications(prev => [rewardNotif, ...prev]);
          addNotification(rewardNotif).catch(err => console.error('Error saving notification:', err));
          newRefCount = 0;
        }

        const updatedUser = { ...u, referralCount: newRefCount };
        if (currentUser && u.id === currentUser.id) {
          setCurrentUser(updatedUser);
          updateUserProfile(currentUser.id, updatedUser).catch(err => console.error('Error updating user:', err));
        }
        return updatedUser;
      }
      return u;
    }));
    
    setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status: 'completed' } : r));
  };

  const handleBroadcast = async (title: string, message: string) => {
    const newNotif: Notification = { id: `n-${Date.now()}`, title, message, timestamp: 'Just now' };
    setNotifications(prev => [newNotif, ...prev]);
    const newAnn: Announcement = { 
      id: `ann-${Date.now()}`, 
      title, 
      description: message, 
      date: 'Latest Update', 
      type: 'news',
      likes: 0,
      likedBy: [],
      comments: []
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    
    // Save to Firebase
    try {
      await Promise.all([
        addNotification(newNotif),
        addAnnouncement(newAnn)
      ]);
    } catch (error) {
      console.error('Error broadcasting:', error);
    }
  };

  const handleSubmitTestimonial = async (content: string, rating: number, image?: string) => {
    if (!currentUser) return;
    const newTestimonial: Testimonial = { 
      id: `t-${Date.now()}`, 
      userId: currentUser.id,
      userName: currentUser.name, 
      userImage: currentUser.profilePicture,
      content, 
      rating, 
      date: 'Just now',
      image,
      likes: 0,
      likedBy: [],
      comments: []
    };
    setTestimonials(prev => [newTestimonial, ...prev]);
    
    // Save to Firebase
    try {
      await addTestimonial(newTestimonial);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
    }
  };

  const currentChatMessages = currentUser ? (conversations.find(c => c.userId === currentUser.id)?.messages || []) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <h1 className="text-4xl font-luxury gold-text tracking-tighter">CELEBRITY BARBER</h1>
          </div>
          <p className="text-zinc-600 text-sm">Initializing elite experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex flex-row justify-between items-center mb-4 sm:mb-8 gap-2 bg-black/90 sticky top-0 z-[100] py-2 sm:py-3 backdrop-blur-md border-b border-zinc-900 px-4">
        <div className="relative group shrink-0">
          <button 
            onClick={() => isAdminLoggedIn ? setView(view === 'admin' ? 'client' : 'admin') : setShowAdminLoginModal(true)} 
            className="focus:outline-none transition-transform active:scale-95 flex items-center gap-2"
          >
            <Logo size="sm" />
          </button>
        </div>
        
        <nav className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 hover:border-[var(--accent)] transition-all shrink-0"
          >
            <div className="relative w-8 h-4 bg-black rounded-full border border-zinc-700 p-0.5">
               <div 
                className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  theme === 'premium' ? 'translate-x-[1.125rem] bg-[var(--accent)]' : 'translate-x-0 bg-zinc-400'
                }`}
               ></div>
            </div>
          </button>

          {isAdminLoggedIn && (
            <button 
              onClick={() => setView(view === 'admin' ? 'client' : 'admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold transition-all border uppercase tracking-widest shrink-0 ${
                view === 'admin' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'gold-gradient text-black border-transparent'
              }`}
            >
              <LayoutDashboard className="w-3 h-3" />
              <span className="hidden sm:inline">{view === 'admin' ? 'Shop' : 'Admin'}</span>
            </button>
          )}

          {(isLoggedIn || isAdminLoggedIn) ? (
            <button onClick={handleLogout} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-3 h-3" />
            </button>
          ) : (
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => { setLoginModalView('login'); setShowLoginModal(true); }} className="px-3 py-1.5 rounded-full text-[9px] font-bold text-zinc-400 border border-zinc-800 hover:border-zinc-600 transition-all uppercase tracking-widest">Login</button>
              <GoldButton onClick={() => { setLoginModalView('signup'); setShowLoginModal(true); }} className="px-3 py-1.5 text-[9px]">Join</GoldButton>
            </div>
          )}
        </nav>
      </header>

      <main className={`mx-auto transition-all duration-500 ${view === 'admin' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {view === 'client' ? (
          <ClientDashboard 
            user={currentUser}
            isLoggedIn={isLoggedIn}
            notifications={notifications}
            announcements={announcements}
            testimonials={testimonials}
            chatMessages={currentChatMessages}
            onReportPayment={handleReportPayment}
            onVipSubscription={handleVipSubscription}
            onReferral={handleAddReferral}
            onSubmitTestimonial={handleSubmitTestimonial}
            onUpdateUser={handleUpdateUser}
            onBook={() => isLoggedIn ? alert('Launching luxury booking engine...') : (() => { setLoginModalView('login'); setShowLoginModal(true); })()}
            onAuthTrigger={() => { setLoginModalView('login'); setShowLoginModal(true); }}
            onSendMessage={handleClientSendMessage}
            onLikeTestimonial={handleLikeTestimonial}
            onCommentTestimonial={handleAddComment}
            onLikeAnnouncement={handleLikeAnnouncement}
            onCommentAnnouncement={handleAddAnnouncementComment}
          />
        ) : (
          <AdminPortal 
            requests={requests}
            users={allUsers}
            referrals={referrals}
            notifications={notifications}
            conversations={conversations}
            announcements={announcements}
            onApprove={handleApprove}
            onReject={(id) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))}
            onConfirmReferral={handleConfirmReferral}
            onBroadcast={handleBroadcast}
            onSendMessage={handleAdminSendMessage}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
      </main>

      {showLoginModal && <Login initialView={loginModalView} onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
      {showAdminLoginModal && <AdminLogin onLogin={handleAdminLogin} onClose={() => setShowAdminLoginModal(false)} />}
    </div>
  );
};

export default App;
