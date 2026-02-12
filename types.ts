
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  timestamp: string;
}

export interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  rating: number;
  date: string;
  image?: string; // Shared photo of the cut
  likes: number;
  likedBy: string[]; // User IDs who liked
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalSpent: number; // Current cycle spending
  lifetimeSpent: number; // Total historical spending
  referralCount: number;
  isVip: boolean;
  vipExpiry?: string;
  pendingSpent?: number;
  profilePicture?: string; // Base64 or URL
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'admin' or userId
  senderName: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface ApprovalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'spending' | 'vip';
  serviceName?: string;
  comment?: string;
  proofOfPayment?: string; 
  proofImage?: string; // Base64 or placeholder URL for simulated receipt
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Referral {
  id: string;
  referrerId: string;
  referredName: string;
  status: 'pending' | 'completed';
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'event' | 'deal' | 'news';
  likes: number;
  likedBy: string[];
  comments: Comment[];
}
