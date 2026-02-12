
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  Crown, 
  CheckCircle2, 
  Bell, 
  UserPlus,
  Gift,
  X,
  Radio,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  Megaphone,
  History,
  Info,
  Quote,
  CreditCard,
  Banknote,
  Upload,
  SmilePlus,
  Calendar,
  AlertTriangle,
  Receipt,
  Settings,
  Camera,
  Trash2,
  Heart,
  MessageCircle,
  Share2,
  Home
} from 'lucide-react';
import { Card, GoldButton } from './CommonUI';
import { SPENDING_THRESHOLD, SERVICES, BONUS_AMOUNT, VIP_SUBSCRIPTION_FEE, ROOM_SERVICE_FEE } from '../constants';
import { User, Notification, Service, Announcement, Testimonial, ChatMessage } from '../types';

interface ClientDashboardProps {
  user: User | null;
  isLoggedIn: boolean;
  notifications: Notification[];
  announcements: Announcement[];
  testimonials: Testimonial[];
  chatMessages: ChatMessage[];
  onReportPayment: (amount: number, serviceName?: string, comment?: string) => void;
  onVipSubscription: (proofRef: string, proofImg: string) => void;
  onReferral: (name: string) => void;
  onBook: () => void;
  onAuthTrigger: () => void;
  onSendMessage: (text: string) => void;
  onSubmitTestimonial?: (content: string, rating: number, image?: string) => void;
  onUpdateUser?: (data: Partial<User>) => void;
  onLikeTestimonial: (id: string) => void;
  onCommentTestimonial: (id: string, text: string) => void;
  onLikeAnnouncement: (id: string) => void;
  onCommentAnnouncement: (id: string, text: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  user, 
  isLoggedIn,
  notifications, 
  announcements,
  testimonials,
  chatMessages,
  onReportPayment, 
  onVipSubscription,
  onReferral,
  onBook,
  onAuthTrigger,
  onSendMessage,
  onSubmitTestimonial,
  onUpdateUser,
  onLikeTestimonial,
  onCommentTestimonial,
  onLikeAnnouncement,
  onCommentAnnouncement
}) => {
  const [reportAmount, setReportAmount] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isRoomService, setIsRoomService] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [testimonialContent, setTestimonialContent] = useState('');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialImage, setTestimonialImage] = useState<string | null>(null);
  const [referralName, setReferralName] = useState('');
  const [showVipModal, setShowVipModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [vipProofRef, setVipProofRef] = useState('');
  const [tempProfileImg, setTempProfileImg] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeAnnCommentId, setActiveAnnCommentId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newAnnCommentText, setNewAnnCommentText] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const testimonialFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showChat, chatMessages]);

  useEffect(() => {
    if (selectedService) {
      const basePrice = selectedService.price;
      const total = basePrice + (isRoomService ? ROOM_SERVICE_FEE : 0);
      setReportAmount(total.toString());
    }
  }, [selectedService, isRoomService]);

  const progress = user ? Math.min(100, (user.totalSpent / SPENDING_THRESHOLD) * 100) : 0;
  const isHot = progress >= 80;

  const chartData = [
    { name: 'Spent', value: user ? user.totalSpent : 0 },
    { name: 'Remaining', value: user ? Math.max(0, SPENDING_THRESHOLD - user.totalSpent) : SPENDING_THRESHOLD }
  ];

  const getAccentColor = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const [colors, setColors] = useState([getAccentColor() || '#D4AF37', '#27272a']);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColors([getAccentColor() || '#D4AF37', '#27272a']);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const handleSubmitReport = () => {
    if (reportAmount) {
      const serviceDisplay = isRoomService 
        ? `${selectedService?.name || 'Session'} (with Room Service)`
        : selectedService?.name || 'Session';
      
      onReportPayment(Number(reportAmount), serviceDisplay, reportComment);
      setReportAmount('');
      setReportComment('');
      setSelectedService(null);
      setIsRoomService(false);
      alert('Confirmation submitted for verification.');
    }
  };

  const handleSendClientMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleReferralSubmit = () => {
    if (referralName.trim()) {
      onReferral(referralName);
      setReferralName('');
      alert('Referral submitted to the concierge.');
    }
  };

  const handleTestimonialSubmit = () => {
    if (testimonialContent.trim() && onSubmitTestimonial) {
      onSubmitTestimonial(testimonialContent, testimonialRating, testimonialImage || undefined);
      setTestimonialContent('');
      setTestimonialImage(null);
      alert('Testimony recorded in the gallery.');
    }
  };

  const handleApplyVip = () => {
    if (vipProofRef.trim()) {
      onVipSubscription(vipProofRef, "simulated_receipt_image_data");
      setShowVipModal(false);
      setVipProofRef('');
      alert('VIP Application submitted. The concierge will verify your payment shortly.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'testimonial') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'profile') setTempProfileImg(reader.result as string);
        else setTestimonialImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (onUpdateUser && tempProfileImg) {
      onUpdateUser({ profilePicture: tempProfileImg });
      setTempProfileImg(null);
      setShowSettingsModal(false);
      alert('Elite profile portrait updated.');
    }
  };

  const handlePostComment = (id: string) => {
    if (newCommentText.trim()) {
      onCommentTestimonial(id, newCommentText);
      setNewCommentText('');
    }
  };

  const handlePostAnnComment = (id: string) => {
    if (newAnnCommentText.trim()) {
      onCommentAnnouncement(id, newAnnCommentText);
      setNewAnnCommentText('');
    }
  };

  const isVipExpired = user?.vipExpiry ? new Date(user.vipExpiry) < new Date() : false;
  const formattedExpiry = user?.vipExpiry ? new Date(user.vipExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="pb-40 space-y-12 animate-fadeIn relative px-4 sm:px-0">
      <div className="py-4 flex items-center justify-between">
        {isLoggedIn && user ? (
          <>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="relative group shrink-0"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-all bg-zinc-950 flex items-center justify-center relative">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-luxury gold-text font-bold">{user.name.charAt(0)}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-5 h-5 gold-text" />
                  </div>
                </div>
              </button>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {user.name} 
                  {user.isVip && <Crown className={`w-5 h-5 ${isVipExpired ? 'text-zinc-600' : 'gold-text'} fill-current`} />}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[8px] text-zinc-600 uppercase tracking-[0.4em] font-black">Elite Profile</p>
                  {user.isVip && formattedExpiry && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isVipExpired ? 'border-red-900/50 bg-red-950/20 text-red-500' : 'border-zinc-800 bg-zinc-900 text-zinc-400'} text-[7px] font-bold uppercase tracking-wider`}>
                      {isVipExpired ? <AlertTriangle className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
                      {isVipExpired ? 'VIP Expired' : `Expires: ${formattedExpiry}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSettingsModal(true)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-[var(--accent)] transition-all">
                <Settings className="w-5 h-5 text-zinc-500" />
              </button>
              <button onClick={() => setShowNotifications(true)} className="relative p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-[var(--accent)] transition-all">
                <Bell className="w-5 h-5 text-zinc-500" />
                {(notifications.length > 0 || announcements.length > 0) && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center w-full space-y-6 py-12">
            <h1 className="text-4xl font-luxury gold-text tracking-tighter">CELEBRITY BARBER</h1>
            <GoldButton onClick={onAuthTrigger} className="px-12">Claim Your Identity</GoldButton>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] gold-text flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Latest Updates
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {announcements.map((ann) => (
            <div key={ann.id} className="min-w-[300px] flex flex-col bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-[var(--accent)]/30 transition-all duration-500">
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600 bg-black/50 px-2 py-1 rounded-md">{ann.type}</span>
                  <span className="text-[7px] text-zinc-700 font-mono">{ann.date}</span>
                </div>
                <h4 className="font-bold text-white group-hover:gold-text transition-colors">{ann.title}</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">"{ann.description}"</p>
                
                {/* Announcement Socials */}
                <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/30">
                  <button 
                    onClick={() => onLikeAnnouncement(ann.id)}
                    className={`flex items-center gap-1.5 ${ann.likedBy.includes(user?.id || '') ? 'gold-text' : 'text-zinc-600 hover:text-white'} transition-colors`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${ann.likedBy.includes(user?.id || '') ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-black">{ann.likes}</span>
                  </button>
                  <button 
                    onClick={() => setActiveAnnCommentId(activeAnnCommentId === ann.id ? null : ann.id)}
                    className={`flex items-center gap-1.5 ${activeAnnCommentId === ann.id ? 'gold-text' : 'text-zinc-600 hover:text-white'} transition-colors`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black">{ann.comments.length}</span>
                  </button>
                </div>
              </div>

              {/* Announcement Comments Drawer */}
              {activeAnnCommentId === ann.id && (
                <div className="bg-black/40 border-t border-zinc-800/50 p-6 space-y-4 animate-slideUp">
                  <div className="space-y-3 max-h-32 overflow-y-auto no-scrollbar">
                    {ann.comments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                          {c.userImage ? <img src={c.userImage} className="w-full h-full object-cover rounded-md" /> : <span className="text-[7px] font-luxury gold-text">{c.userName.charAt(0)}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="text-[8px] text-white font-bold">{c.userName}</p>
                          <p className="text-[9px] text-zinc-400 line-clamp-2">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    {ann.comments.length === 0 && <p className="text-[8px] text-zinc-700 uppercase italic text-center">Open for discussion...</p>}
                  </div>
                  {isLoggedIn && (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newAnnCommentText}
                        onChange={(e) => setNewAnnCommentText(e.target.value)}
                        placeholder="Comment..." 
                        className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-[9px] text-white outline-none focus:border-[var(--accent)]"
                        onKeyPress={(e) => e.key === 'Enter' && handlePostAnnComment(ann.id)}
                      />
                      <button onClick={() => handlePostAnnComment(ann.id)} className="p-2 gold-gradient text-black rounded-lg"><Send className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Profile Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border gold-border rounded-[2.5rem] p-10 relative shadow-2xl">
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <div className="text-center space-y-8 mb-10">
              <h2 className="text-2xl font-luxury gold-text uppercase tracking-widest">Elite Settings</h2>
              
              <div className="relative mx-auto w-32 h-32 group">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-zinc-800 shadow-2xl relative">
                  {(tempProfileImg || user?.profilePicture) ? (
                    <img src={tempProfileImg || user?.profilePicture} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <Sparkles className="w-12 h-12 gold-text opacity-20" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-4 gold-gradient rounded-2xl text-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFileChange(e, 'profile')} 
                className="hidden" 
                accept="image/*" 
              />
              
              <div className="space-y-1">
                <p className="text-white font-bold text-lg">{user?.name}</p>
                <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-black">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              {tempProfileImg && (
                <GoldButton onClick={handleSaveProfile} className="w-full !py-5">Finalize Transmission</GoldButton>
              )}
              {user?.profilePicture && (
                <button 
                  onClick={() => onUpdateUser?.({ profilePicture: undefined })}
                  className="w-full py-5 border border-red-900/30 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Relinquish Portrait
                </button>
              )}
              {!tempProfileImg && (
                <button onClick={() => setShowSettingsModal(false)} className="w-full py-5 bg-zinc-800 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest">Return to Dashboard</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* The Elite Gallery - Social Section */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] gold-text flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> The Elite Gallery
        </h3>
        <div className="grid gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:border-[var(--accent)]/30 transition-all duration-700">
              {/* Gallery Header */}
              <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                    {t.userImage ? <img src={t.userImage} className="w-full h-full object-cover" /> : <span className="font-luxury gold-text text-sm">{t.userName.charAt(0)}</span>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">{t.userName} <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" /></p>
                    <p className="text-[8px] text-zinc-600 uppercase font-black">{t.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-2.5 h-2.5 ${i < t.rating ? 'gold-text fill-current' : 'text-zinc-800'}`} />
                  ))}
                </div>
              </div>

              {/* Shared Image */}
              {t.image && (
                <div className="aspect-[4/3] w-full bg-zinc-950 overflow-hidden relative">
                  <img src={t.image} alt="Elite Cut" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <p className="text-white text-sm font-luxury italic">"{t.content}"</p>
                  </div>
                </div>
              )}

              {!t.image && (
                <div className="p-8 text-center bg-zinc-900/10">
                  <Quote className="w-8 h-8 gold-text opacity-10 mx-auto mb-4" />
                  <p className="text-zinc-300 italic text-sm leading-relaxed">"{t.content}"</p>
                </div>
              )}

              {/* Interaction Footer */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => onLikeTestimonial(t.id)}
                    className={`flex items-center gap-2 group/btn ${t.likedBy.includes(user?.id || '') ? 'gold-text' : 'text-zinc-500 hover:text-white'} transition-colors`}
                  >
                    <Heart className={`w-5 h-5 ${t.likedBy.includes(user?.id || '') ? 'fill-current' : 'group-hover/btn:scale-110 transition-transform'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.likes} Likes</span>
                  </button>
                  <button 
                    onClick={() => setActiveCommentId(activeCommentId === t.id ? null : t.id)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.comments.length} Discussion</span>
                  </button>
                  <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Comment Section */}
                {activeCommentId === t.id && (
                  <div className="pt-6 border-t border-zinc-800/50 space-y-6 animate-slideUp">
                      <div className="space-y-4 max-h-48 overflow-y-auto no-scrollbar">
                        {t.comments.map(c => (
                          <div key={c.id} className="flex gap-3">
                            <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                              {c.userImage ? <img src={c.userImage} className="w-full h-full object-cover rounded-lg" /> : <span className="text-[8px] font-luxury gold-text">{c.userName.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-[9px] text-white font-bold">{c.userName} <span className="text-zinc-600 font-normal ml-2">{c.timestamp}</span></p>
                              <p className="text-[10px] text-zinc-400">{c.text}</p>
                            </div>
                          </div>
                        ))}
                        {t.comments.length === 0 && <p className="text-[9px] text-zinc-700 uppercase italic text-center py-2">No transmissions yet...</p>}
                      </div>
                      
                      {isLoggedIn && (
                        <div className="flex gap-3 items-center">
                          <input 
                            type="text" 
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Join discussion..." 
                            className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-[var(--accent)] transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && handlePostComment(t.id)}
                          />
                          <button 
                            onClick={() => handlePostComment(t.id)}
                            className="p-3 gold-gradient text-black rounded-xl active:scale-95 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8 relative z-20">
        {/* VIP Portal Card */}
        <Card className={`border-[var(--accent)]/20 overflow-hidden relative ${!isLoggedIn ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Crown className="w-32 h-32 rotate-12" />
          </div>
          <div className="space-y-6 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[var(--accent)]/10 rounded-2xl gold-text"><Crown className="w-6 h-6" /></div>
              <div>
                <h3 className="text-xl font-bold">VIP Portal</h3>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">N{VIP_SUBSCRIPTION_FEE.toLocaleString()} / Month Access</p>
              </div>
            </div>
            {user?.isVip && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${isVipExpired ? 'bg-red-950/20 border-red-900/50' : 'bg-emerald-950/10 border-emerald-900/30'}`}>
                {isVipExpired ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Calendar className="w-5 h-5 gold-text" />}
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isVipExpired ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isVipExpired ? 'Access Expired' : 'Access Active'}
                  </p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">
                    {isVipExpired ? 'Renew subscription to restore benefits' : `Valid until ${formattedExpiry}`}
                  </p>
                </div>
              </div>
            )}
            <div className="bg-black/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center rounded-xl"><Banknote className="w-5 h-5 gold-text" /></div>
                <div>
                  <p className="text-zinc-500 uppercase font-black text-[8px] tracking-widest">Bank Deposit Details</p>
                  <p className="font-mono text-[11px] text-white">OPAY BANK | 9161312015</p>
                </div>
              </div>
              <ul className="space-y-2">
                {['2 Premium Cuts Per Month', 'Unlimited Lining & Edges', 'Priority Concierge Access'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <CheckCircle2 className="w-3 h-3 gold-text" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <GoldButton onClick={() => setShowVipModal(true)} className="w-full !py-5 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> {user?.isVip ? 'Renew VIP Access' : 'Apply for VIP Access'}
            </GoldButton>
          </div>
        </Card>

        {/* VIP Apply Modal */}
        {showVipModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
            <div className="w-full max-w-md bg-zinc-900 border gold-border rounded-[2.5rem] p-8 relative shadow-2xl">
              <button onClick={() => setShowVipModal(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center mx-auto gold-text"><Receipt className="w-8 h-8" /></div>
                <h2 className="text-2xl font-luxury gold-text uppercase tracking-widest">Submit Receipt</h2>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Verify your N{VIP_SUBSCRIPTION_FEE.toLocaleString()} subscription</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-[0.3em] font-black text-zinc-600">Transaction Reference / Proof Ref</label>
                  <input 
                    type="text" 
                    value={vipProofRef} 
                    onChange={(e) => setVipProofRef(e.target.value)} 
                    placeholder="Enter Bank Ref e.g. TR-99120" 
                    className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all text-xs"
                  />
                </div>
                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-black/50 space-y-3 cursor-pointer hover:border-[var(--accent)]/50 transition-all">
                  <Upload className="w-8 h-8 mx-auto text-zinc-700" />
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Simulate Receipt Upload</p>
                </div>
                <GoldButton onClick={handleApplyVip} disabled={!vipProofRef} className="w-full !py-5">Submit for Approval</GoldButton>
              </div>
            </div>
          </div>
        )}

        {/* Post Testimony Card (Redesigned with Photo Upload) */}
        <Card className={`border-[var(--accent)]/10 transition-all ${!isLoggedIn ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[var(--accent)]/10 rounded-2xl gold-text"><SmilePlus className="w-5 h-5" /></div>
            <div><h3 className="text-lg font-bold">Log your Look</h3><p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Broadcast your fresh cut to the gallery</p></div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setTestimonialRating(star)}>
                        <Star className={`w-5 h-5 ${star <= testimonialRating ? 'gold-text fill-current' : 'text-zinc-800'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea rows={4} value={testimonialContent} onChange={(e) => setTestimonialContent(e.target.value)} placeholder="Describe the masterpiece..." className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-[10px] text-white resize-none focus:border-[var(--accent)] transition-all outline-none" />
               </div>
               
               <div className="space-y-4">
                  <div 
                    onClick={() => testimonialFileRef.current?.click()}
                    className="aspect-video w-full border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center bg-black/40 hover:border-[var(--accent)] transition-all cursor-pointer overflow-hidden relative"
                  >
                    {testimonialImage ? (
                      <>
                        <img src={testimonialImage} className="w-full h-full object-cover" />
                        <button onClick={(e) => { e.stopPropagation(); setTestimonialImage(null); }} className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-lg text-white"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-zinc-700 mb-2" />
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Attach Visual Proof</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={testimonialFileRef} 
                    onChange={(e) => handleFileChange(e, 'testimonial')} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <GoldButton className="w-full !py-5" disabled={!testimonialContent.trim()} onClick={handleTestimonialSubmit}>Finalize Broadcast</GoldButton>
               </div>
            </div>
          </div>
        </Card>

        {/* Existing Rewards & Analytics cards... */}
        <Card className={`relative group border-[var(--accent)]/20 ${!isLoggedIn ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] gold-text">Barber Streak</h3>
                 <p className="text-2xl font-luxury uppercase leading-tight">Spending Target</p>
                 <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                    <Info className="w-3 h-3" />
                    <p className="text-[9px] uppercase tracking-widest font-bold">Unlock N{BONUS_AMOUNT} credit at N5,000</p>
                 </div>
               </div>
               <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <Gift className="w-4 h-4 gold-text" />
                  <div className="text-right">
                    <p className="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Bonus Reward</p>
                    <p className="text-xs font-bold gold-text">N{BONUS_AMOUNT} Credit</p>
                  </div>
               </div>
            </div>
            <div className="w-full h-3 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden shadow-inner">
               <div className={`h-full transition-all duration-1000 ${isHot ? 'bg-gradient-to-r from-orange-500 to-[var(--accent)]' : 'gold-gradient'}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between items-center px-1">
               <div className="flex items-baseline gap-1">
                  <p className="text-[14px] font-mono font-bold text-white">N{(user?.totalSpent || 0).toLocaleString()}</p>
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Spent</p>
               </div>
               <div className="flex items-baseline gap-1">
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Target</p>
                  <p className="text-[14px] font-mono font-bold gold-text">N{SPENDING_THRESHOLD.toLocaleString()}</p>
               </div>
            </div>
          </div>
        </Card>

        <Card className={`border-purple-500/10 ${!isLoggedIn ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><UserPlus className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-bold">Referral Hub</h3>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Progress Toward Free Cut</p>
            </div>
          </div>
          <div className="space-y-10">
            <div className="flex justify-center gap-10 items-center">
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    (user?.referralCount || 0) >= slot ? 'gold-border gold-text bg-[var(--accent)]/10 shadow-[0_0_15px_var(--accent-glow)]' : 'border-zinc-800 text-zinc-700'
                  }`}>
                    {slot === 3 ? <Gift className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-[8px] font-black uppercase tracking-widest ${ (user?.referralCount || 0) >= slot ? 'gold-text' : 'text-zinc-600'}`}>
                      {slot === 1 ? '30% OFF' : slot === 2 ? '30% OFF' : 'FREE CUT'}
                    </p>
                    <p className="text-[6px] text-zinc-700 font-bold uppercase tracking-tighter opacity-40">Session {slot}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input type="text" value={referralName} onChange={(e) => setReferralName(e.target.value)} placeholder="Friend's Full Name..." className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-[var(--accent)] transition-all" />
              <GoldButton onClick={handleReferralSubmit}>Refer</GoldButton>
            </div>
          </div>
        </Card>

        <Card className={`border-emerald-500/10 bg-emerald-500/5 ${!isLoggedIn ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
            <div><h3 className="text-lg font-bold">Session Confirmation</h3><p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Report Service Session</p></div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest text-zinc-700 font-black">Session Type</label>
                <select onChange={(e) => { const s = SERVICES.find(sv => sv.id === e.target.value); if (s) { setSelectedService(s); } }} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-[10px] text-white focus:border-[var(--accent)] transition-all outline-none">
                  <option value="">Select Service</option>
                  {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest text-zinc-700 font-black">Amount Paid (N)</label>
                <input type="number" value={reportAmount} onChange={(e) => setReportAmount(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-[10px] text-white focus:border-[var(--accent)] transition-all outline-none" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800 rounded-2xl group hover:border-[var(--accent)]/40 transition-all cursor-pointer" onClick={() => setIsRoomService(!isRoomService)}>
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${isRoomService ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Elite Room Service</p>
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">Additional N{ROOM_SERVICE_FEE} Premium Fee</p>
                  </div>
               </div>
               <div className={`w-10 h-5 rounded-full relative transition-colors ${isRoomService ? 'bg-[var(--accent)]' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRoomService ? 'left-6' : 'left-1'}`}></div>
               </div>
            </div>

            <textarea rows={3} value={reportComment} onChange={(e) => setReportComment(e.target.value)} placeholder="Session notes for audit..." className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-5 text-[10px] text-white resize-none focus:border-[var(--accent)] transition-all outline-none" />
            <GoldButton className="w-full !py-5" disabled={!reportAmount} onClick={handleSubmitReport}>Confirm Service Completion</GoldButton>
          </div>
        </Card>

        <Card className={`transition-all duration-500 h-72 ${!isLoggedIn ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] gold-text">Balance Distribution</h3>
             <div className="px-3 py-1 bg-[var(--accent)]/5 rounded-full border border-[var(--accent)]/10">
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Target: N{SPENDING_THRESHOLD}</p>
             </div>
          </div>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} 
                  innerRadius="70%" 
                  outerRadius="95%" 
                  paddingAngle={8} 
                  dataKey="value" 
                  stroke="none"
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-luxury gold-text font-bold">
                {user ? Math.round((user.totalSpent / SPENDING_THRESHOLD) * 100) : 0}%
              </span>
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mt-1">Refining...</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-[110] w-full max-w-[95%] sm:max-w-md mx-auto px-4">
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 p-2.5 rounded-[2rem] flex items-center gap-3 shadow-[0_40px_80px_rgba(0,0,0,0.9)]">
          <button onClick={onBook} className="flex-1 gold-gradient text-black h-16 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all">Secure Session</button>
          {isLoggedIn && (
            <button onClick={() => setShowChat(true)} className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-[2rem] flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black shadow-xl duration-500"><MessageSquare className="w-6 h-6" /></button>
          )}
        </div>
      </div>
      
      {showNotifications && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-900 rounded-[3rem] border border-zinc-800 overflow-hidden h-[80vh] flex flex-col shadow-2xl">
            <div className="p-8 border-b border-zinc-800 bg-black/40 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-[var(--accent)]/10 rounded-2xl gold-text"><Bell className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-luxury text-xl">Inbox & Stream</h3>
                  <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Global & System Alerts</p>
                </div>
              </div>
              <button onClick={() => setShowNotifications(false)} className="p-3 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-2">
                  <History className="w-3 h-3" /> System Logs
                </h4>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2 border-l-4 border-l-[var(--accent)]">
                      <div className="flex justify-between items-center">
                        <h5 className="font-bold text-white text-xs">{notif.title}</h5>
                        <span className="text-[8px] text-zinc-700 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-800 uppercase italic tracking-widest text-center py-4">No recent system logs...</p>
                )}
              </section>

              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] gold-text flex items-center gap-2">
                  <Megaphone className="w-3 h-3" /> Latest Updates
                </h4>
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-6 bg-black border border-zinc-800 rounded-3xl space-y-3 relative group overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-[7px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-md">{ann.type}</span>
                      <span className="text-[7px] text-zinc-700 font-mono">{ann.date}</span>
                    </div>
                    <h5 className="font-bold text-white group-hover:gold-text transition-colors">{ann.title}</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">"{ann.description}"</p>
                  </div>
                ))}
              </section>
            </div>
            <div className="p-8 bg-black/60 border-t border-zinc-800 text-center shrink-0">
               <p className="text-[8px] text-zinc-700 uppercase tracking-widest font-black">End of Stream Access</p>
            </div>
          </div>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/95 backdrop-blur-lg p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-900 rounded-t-[3rem] sm:rounded-[4rem] border-t sm:border border-zinc-800 overflow-hidden h-[90vh] sm:h-[80vh] flex flex-col shadow-2xl">
            <div className="p-8 border-b border-zinc-800 bg-black/40 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-[var(--accent)]/10 flex items-center justify-center relative">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} className="w-full h-full object-cover rounded-3xl" />
                  ) : (
                    <Sparkles className="w-6 h-6 gold-text" />
                  )}
                </div>
                <div><h3 className="font-luxury text-xl">Concierge Stream</h3><p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Elite Support</p></div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-3 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-black/20">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} animate-slideUp`}>
                  <div className={`max-w-[85%] px-7 py-5 rounded-[2.5rem] text-xs leading-relaxed shadow-xl ${
                    msg.senderId === user?.id ? 'gold-gradient text-black font-bold' : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-8 bg-black/60 border-t border-zinc-800 flex gap-4 items-center">
              <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendClientMessage()} placeholder="Inquire with concierge..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl px-8 py-5 text-xs text-white outline-none focus:border-[var(--accent)] transition-all" />
              <button onClick={handleSendClientMessage} disabled={!messageInput.trim()} className="p-5 gold-gradient text-black rounded-3xl shadow-2xl hover:brightness-110 active:scale-95 transition-all"><Send className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
