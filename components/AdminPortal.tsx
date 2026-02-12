import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BarChart3, 
  Radio, 
  Check, 
  X, 
  Eye,
  CreditCard,
  UserCheck,
  Send,
  Activity,
  MessageSquare,
  Plus,
  History as HistoryIcon,
  Crown,
  Calendar,
  AlertTriangle,
  Receipt,
  FileText,
  Upload,
  Search,
  Filter,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, GoldButton } from './CommonUI';
import { ApprovalRequest, User, Referral, Conversation, ChatMessage, Announcement, Notification } from '../types';

interface AdminPortalProps {
  requests: ApprovalRequest[];
  users: User[];
  referrals: Referral[];
  notifications: Notification[];
  conversations: Conversation[];
  announcements: Announcement[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onConfirmReferral: (referralId: string) => void;
  onBroadcast: (title: string, message: string) => void;
  onSendMessage: (userId: string, text: string) => void;
  onMarkAsRead: (userId: string) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ 
  requests = [], 
  users = [], 
  referrals = [],
  conversations = [],
  announcements = [],
  onApprove, 
  onReject,
  onConfirmReferral,
  onBroadcast,
  onSendMessage,
  onMarkAsRead
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'referrals' | 'analytics' | 'broadcast' | 'messages' | 'vips' | 'ledger'>('approvals');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProof, setSelectedProof] = useState<ApprovalRequest | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSelectingNewClient, setIsSelectingNewClient] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.userId === activeConversationId);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const totalRevenue = users.reduce((acc, u) => acc + (u.lifetimeSpent || 0), 0);
  
  const vipUsers = users.filter(u => u.isVip);
  const activeVips = vipUsers.filter(u => u.vipExpiry && new Date(u.vipExpiry) >= new Date());
  const expiredVips = vipUsers.filter(u => !u.vipExpiry || new Date(u.vipExpiry) < new Date());

  // Group approved requests by date for the Ledger
  const transactionsByDate = approvedRequests.reduce((acc, req) => {
    // Using a simplified date for grouping, in real app use req.timestamp or a proper Date field
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(req);
    return acc;
  }, {} as Record<string, ApprovalRequest[]>);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeConversationId) { onMarkAsRead(activeConversationId); }
  }, [activeConversation?.messages, activeConversationId, onMarkAsRead]);

  const handleSendReply = () => {
    if (replyText.trim() && activeConversationId) {
      onSendMessage(activeConversationId, replyText);
      setReplyText('');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVips = vipUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-[80vh] flex flex-col pb-32">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-black shadow-xl shrink-0"><ShieldCheck className="w-6 h-6" /></div>
          <div><h1 className="text-xl font-luxury gold-text uppercase">Command Center</h1><p className="text-[8px] text-zinc-500 uppercase tracking-[0.4em] font-black">Management Access</p></div>
        </div>
        <div className="flex gap-4">
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-[10px] font-mono font-bold text-zinc-400">N{totalRevenue.toLocaleString()} Revenue</span>
          </div>
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center gap-2">
            <Crown className="w-4 h-4 gold-text" /><span className="text-[10px] font-mono font-bold text-zinc-400">{activeVips.length} VIPs</span>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex-1 animate-slideUp px-4">
        <div className="rounded-[2.5rem] overflow-hidden border border-zinc-800/50 bg-black/40 backdrop-blur-xl min-h-[600px] flex flex-col">
          
          {activeTab === 'approvals' && (
            <div className="p-6 sm:p-10 space-y-6 max-w-4xl mx-auto w-full">
               <div className="flex items-center justify-between mb-8 border-b border-zinc-800/50 pb-6">
                  <div><h2 className="text-xl font-luxury gold-text uppercase">Audit Log</h2><p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black">Pending Authorization</p></div>
                  <span className="bg-red-500/10 text-red-400 text-[10px] px-4 py-1.5 rounded-full border border-red-500/20 uppercase tracking-widest">{pendingRequests.length} Pending</span>
               </div>
               {pendingRequests.map((req) => (
                  <Card key={req.id} className={`p-6 sm:p-8 hover:border-[var(--accent)]/40 transition-all ${req.type === 'vip' ? 'border-l-4 border-l-[var(--accent)] bg-[var(--accent)]/5' : 'bg-zinc-900/40'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-white">{req.userName}</p>
                          {req.type === 'vip' && <Crown className="w-4 h-4 gold-text" />}
                        </div>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          {req.type === 'vip' ? <Receipt className="w-3 h-3 gold-text" /> : <FileText className="w-3 h-3 text-zinc-500" />}
                          {req.type === 'vip' ? 'VIP SUBSCRIPTION REQUEST' : `SERVICE SESSION: ${req.serviceName}`}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-luxury ${req.type === 'vip' ? 'gold-text' : 'text-white'}`}>N{req.amount.toLocaleString()}</span>
                          <button onClick={() => setSelectedProof(req)} className="px-3 py-2 bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"><Eye className="w-3.5 h-3.5 inline mr-1" /> View Receipt</button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => onReject(req.id)} className="p-4 rounded-2xl bg-zinc-800/50 text-zinc-500 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
                        <GoldButton onClick={() => onApprove(req.id)} className="!py-4 px-8 shadow-xl">Approve</GoldButton>
                      </div>
                    </div>
                  </Card>
               ))}
               {pendingRequests.length === 0 && (
                 <div className="text-center py-20 opacity-20">
                   <Check className="w-16 h-16 mx-auto mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest">Audit Ledger Clear</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto w-full flex-1">
               <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-800/50 pb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-luxury gold-text uppercase">Financial Ledger</h2>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black">Approved Transaction Stream</p>
                  </div>
                  <div className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><TrendingUp className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Aggregate Flow</p>
                      <p className="text-xl font-bold text-white">N{approvedRequests.reduce((s, r) => s + r.amount, 0).toLocaleString()}</p>
                    </div>
                  </div>
               </div>

               <div className="space-y-12">
                 {Object.entries(transactionsByDate).length > 0 ? (
                   // Added explicit type for [date, items] to fix 'unknown' property error
                   Object.entries(transactionsByDate).sort().reverse().map(([date, items]: [string, ApprovalRequest[]]) => (
                     <div key={date} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{date}</h3>
                          <div className="flex-1 h-[1px] bg-zinc-800"></div>
                          {/* Corrected items.reduce type error */}
                          <p className="text-[10px] font-mono font-bold gold-text">N{items.reduce((s, r) => s + r.amount, 0).toLocaleString()}</p>
                        </div>
                        <div className="grid gap-3">
                          {/* Corrected items.map type error */}
                          {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl hover:bg-zinc-800/20 transition-all">
                               <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'vip' ? 'bg-[var(--accent)]/10 gold-text' : 'bg-zinc-800 text-zinc-500'}`}>
                                   {item.type === 'vip' ? <Crown className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                 </div>
                                 <div>
                                   <p className="text-xs font-bold text-white">{item.userName}</p>
                                   <p className="text-[8px] text-zinc-600 uppercase font-black">{item.type === 'vip' ? 'VIP Access Fee' : item.serviceName || 'Session Payment'}</p>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className="text-sm font-bold text-emerald-500">+ N{item.amount.toLocaleString()}</p>
                                 <div className="flex items-center justify-end gap-1 text-[7px] text-zinc-700 font-mono uppercase">
                                   <Clock className="w-2.5 h-2.5" /> {item.timestamp}
                                 </div>
                               </div>
                            </div>
                          ))}
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-20 text-center opacity-10">
                      <Receipt className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">No Processed Transactions</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {activeTab === 'vips' && (
            <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto w-full flex-1">
               <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-800/50 pb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-luxury gold-text uppercase">VIP Registry</h2>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black">Managing Elite Memberships</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Active Elite</p>
                      <p className="text-sm font-bold gold-text">{activeVips.length}</p>
                    </div>
                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Expiring Soon</p>
                      <p className="text-sm font-bold text-red-500">{expiredVips.length}</p>
                    </div>
                  </div>
               </div>

               <div className="relative mb-6">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                 <input 
                  type="text" 
                  placeholder="Search Registry..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-xs text-white focus:border-[var(--accent)] transition-all outline-none" 
                 />
               </div>

               <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/20">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                   <thead>
                     <tr className="bg-black/40 text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-black border-b border-zinc-800">
                       <th className="px-8 py-5">Client Identity</th>
                       <th className="px-6 py-5">Membership Expiry</th>
                       <th className="px-6 py-5 text-center">Status</th>
                       <th className="px-6 py-5 text-right">Lifetime Value</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800/30">
                     {filteredVips.map((u) => {
                       const isUExpired = u.vipExpiry ? new Date(u.vipExpiry) < new Date() : true;
                       return (
                         <tr key={u.id} className="group hover:bg-zinc-800/20 transition-all cursor-default">
                           <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-black text-xs shadow-lg">
                                 {u.name.charAt(0)}
                               </div>
                               <div>
                                 <p className="text-xs font-bold text-white group-hover:gold-text transition-colors">{u.name}</p>
                                 <p className="text-[8px] text-zinc-600 uppercase font-black">{u.email}</p>
                               </div>
                             </div>
                           </td>
                           <td className="px-6 py-6 font-mono text-[10px] text-zinc-400">
                             {u.vipExpiry ? new Date(u.vipExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never Set'}
                           </td>
                           <td className="px-6 py-6">
                             <div className="flex justify-center">
                               {isUExpired ? (
                                 <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[8px] font-black uppercase tracking-widest">
                                   <AlertTriangle className="w-2.5 h-2.5" /> Expired
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full gold-text text-[8px] font-black uppercase tracking-widest">
                                   <Crown className="w-2.5 h-2.5 fill-current" /> Active Elite
                                 </div>
                               )}
                             </div>
                           </td>
                           <td className="px-6 py-6 text-right">
                             <p className="text-xs font-luxury text-white">N{u.lifetimeSpent.toLocaleString()}</p>
                             <p className="text-[7px] text-zinc-700 uppercase font-black">Net Transmission</p>
                           </td>
                         </tr>
                       );
                     })}
                     {filteredVips.length === 0 && (
                       <tr>
                         <td colSpan={4} className="py-20 text-center">
                            <div className="opacity-20 flex flex-col items-center gap-4">
                              <Crown className="w-12 h-12" />
                              <p className="text-[10px] uppercase tracking-widest font-black">Registry Empty</p>
                            </div>
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex flex-col md:flex-row h-[calc(100vh-280px)] min-h-[600px]">
              {/* Client List Sidebar */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800/50 bg-black/20 overflow-y-auto scrollbar-hide shrink-0 max-h-48 md:max-h-full">
                <div className="p-6 sticky top-0 bg-black/60 backdrop-blur-md z-10 border-b border-zinc-800/50 flex justify-between items-center">
                   <h3 className="text-[9px] font-black uppercase tracking-[0.3em] gold-text">Conversations</h3>
                   <button onClick={() => setIsSelectingNewClient(!isSelectingNewClient)} className="p-2 gold-gradient rounded-lg text-black hover:rotate-90 transition-transform"><Plus className="w-3 h-3" /></button>
                </div>
                {isSelectingNewClient ? (
                  <div className="p-4 space-y-2">
                    <p className="text-[7px] uppercase tracking-widest font-black text-zinc-500 px-4 mb-2">Select Client</p>
                    {users.map(u => (
                      <button key={u.id} onClick={() => { setActiveConversationId(u.id); setIsSelectingNewClient(false); }} className="w-full p-3 text-left rounded-xl hover:bg-[var(--accent)]/10 text-xs font-bold text-zinc-300">
                        {u.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button key={conv.userId} onClick={() => setActiveConversationId(conv.userId)} className={`w-full p-6 text-left transition-all relative ${activeConversationId === conv.userId ? 'bg-[var(--accent)]/5' : 'hover:bg-zinc-800/30'}`}>
                      {activeConversationId === conv.userId && <div className="absolute left-0 top-0 bottom-0 w-1 gold-gradient"></div>}
                      <div className="flex justify-between items-center mb-1">
                        <p className={`font-bold text-xs ${conv.unreadCount > 0 ? 'text-white' : 'text-zinc-500'}`}>{conv.userName}</p>
                        {conv.unreadCount > 0 && <span className="bg-red-500 text-[7px] font-black px-1.5 py-0.5 rounded-full">{conv.unreadCount}</span>}
                      </div>
                      <p className={`text-[9px] truncate ${conv.unreadCount > 0 ? 'text-[var(--accent)] font-bold' : 'text-zinc-700'}`}>{conv.lastMessage}</p>
                    </button>
                  ))
                )}
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col bg-black/40 relative overflow-hidden">
                 {activeConversationId ? (
                   <>
                    <div className="p-4 sm:p-6 border-b border-zinc-800/50 bg-black/60 backdrop-blur-md shrink-0">
                      <div className="flex items-center gap-3 mx-auto w-full max-w-2xl">
                         <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black shadow-lg"><Users className="w-5 h-5" /></div>
                         <div><h4 className="font-bold text-sm text-white">{activeConversation?.userName || 'Direct Channel'}</h4><p className="text-[7px] text-zinc-500 uppercase tracking-widest font-black">Direct Secure Channel</p></div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-hide">
                      <div className="max-w-2xl mx-auto space-y-8">
                        {activeConversation?.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            <div className="max-w-[85%] space-y-1">
                              <div className={`px-6 py-4 rounded-[1.8rem] text-xs leading-relaxed shadow-xl ${
                                msg.senderId === 'admin' 
                                  ? 'gold-gradient text-black font-bold rounded-tr-sm' 
                                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                              }`}>
                                {msg.text}
                              </div>
                              <p className={`text-[7px] font-black uppercase tracking-widest text-zinc-700 ${msg.senderId === 'admin' ? 'text-right' : 'text-left'}`}>
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-6 bg-black/80 backdrop-blur-xl border-t border-zinc-800/50 shrink-0">
                      <div className="flex gap-4 max-w-2xl mx-auto items-center">
                        <input 
                          type="text" 
                          value={replyText} 
                          onChange={(e) => setReplyText(e.target.value)} 
                          onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} 
                          placeholder="Type elite response..." 
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-zinc-600" 
                        />
                        <button 
                          onClick={handleSendReply} 
                          disabled={!replyText.trim()}
                          className="p-4 gold-gradient text-black rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-30"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 p-12 text-center">
                     <MessageSquare className="w-20 h-20 mb-6" />
                     <p className="text-sm font-black uppercase tracking-[0.5em]">Direct Client Transmission</p>
                     <p className="text-[10px] mt-4 uppercase tracking-widest">Select a channel to begin</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
             <div className="p-10 space-y-6 max-w-4xl mx-auto w-full">
                <h2 className="text-xl font-luxury gold-text uppercase">Referral Manager</h2>
                <div className="space-y-4">
                  {pendingReferrals.map(ref => (
                    <Card key={ref.id} className="flex items-center justify-between p-8 bg-zinc-900/40">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-[var(--accent)]"><UserCheck className="w-6 h-6" /></div>
                         <div><p className="text-lg font-bold text-white">{ref.referredName}</p><p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Referred By: {users.find(u => u.id === ref.referrerId)?.name || 'Unknown'}</p></div>
                      </div>
                      <GoldButton onClick={() => onConfirmReferral(ref.id)} className="px-6 py-3">Confirm Completion</GoldButton>
                    </Card>
                  ))}
                  {pendingReferrals.length === 0 && (
                    <div className="text-center py-20 opacity-20">
                      <Users className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">No Pending Referrals</p>
                    </div>
                  )}
                </div>
             </div>
          )}

          {activeTab === 'analytics' && (
             <div className="p-10 space-y-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <div><h2 className="text-xl font-luxury gold-text uppercase">Client Streaks</h2><p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Performance Leaderboard</p></div>
                  <input type="text" placeholder="Search database..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black border border-zinc-800 rounded-xl p-4 text-[10px] w-full sm:w-64 focus:border-[var(--accent)] transition-all" />
                </div>
                <div className="grid gap-4">
                   {filteredUsers.sort((a,b) => b.lifetimeSpent - a.lifetimeSpent).map(u => {
                     const isUExpired = u.vipExpiry ? new Date(u.vipExpiry) < new Date() : false;
                     return (
                      <div key={u.id} className={`flex items-center justify-between p-6 bg-zinc-900/20 border ${u.isVip ? 'border-[var(--accent)]/40' : 'border-zinc-800'} rounded-3xl hover:border-[var(--accent)] transition-all group relative overflow-hidden`}>
                         {u.isVip && <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Crown className="w-12 h-12 rotate-12" /></div>}
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center font-bold text-[var(--accent)] border border-zinc-800">{u.name.charAt(0)}</div>
                           <div>
                             <div className="flex items-center gap-2">
                               <p className="text-xs font-bold text-white">{u.name}</p>
                               {u.isVip && <Crown className={`w-3 h-3 ${isUExpired ? 'text-zinc-600' : 'gold-text'} fill-current`} />}
                             </div>
                             <p className="text-[8px] text-zinc-600 uppercase font-black">{u.email}</p>
                             {u.isVip && u.vipExpiry && (
                               <div className={`flex items-center gap-1 mt-1 text-[7px] font-black uppercase tracking-tighter ${isUExpired ? 'text-red-500' : 'text-zinc-500'}`}>
                                 {isUExpired ? <AlertTriangle className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
                                 {isUExpired ? 'Expired VIP' : `Ends: ${new Date(u.vipExpiry).toLocaleDateString()}`}
                               </div>
                             )}
                           </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-luxury gold-text font-bold">N{u.totalSpent.toLocaleString()}</p>
                            <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Current Cycle</p>
                            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-widest mt-1">N{u.lifetimeSpent.toLocaleString()} Lifetime</p>
                         </div>
                      </div>
                   )})}
                </div>
             </div>
          )}

          {activeTab === 'broadcast' && (
             <div className="p-10 space-y-12 max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Plus className="w-4 h-4" /> New Shop Broadcast</h3>
                     <div className="space-y-4">
                        <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-xs text-white focus:border-[var(--accent)] outline-none" placeholder="Broadcast Title" />
                        <textarea rows={5} value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-xs text-white resize-none focus:border-[var(--accent)] outline-none" placeholder="Broadcast message content..." />
                        <GoldButton className="w-full !py-5" disabled={!broadcastTitle || !broadcastMsg} onClick={() => { onBroadcast(broadcastTitle, broadcastMsg); setBroadcastTitle(''); setBroadcastMsg(''); alert('Broadcast initialized.'); }}>Initialize Transmission</GoldButton>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><HistoryIcon className="w-4 h-4" /> Past Transmissions</h3>
                     <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                       {announcements.map((ann) => (
                         <div key={ann.id} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-2"><div className="flex justify-between items-center"><h4 className="font-bold text-white text-xs">{ann.title}</h4><span className="text-[8px] text-zinc-700 font-mono">{ann.date}</span></div><p className="text-[10px] text-zinc-500 leading-relaxed">"{ann.description}"</p></div>
                       ))}
                     </div>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-[110] w-full max-w-[95%] sm:max-w-4xl mx-auto px-4">
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-700/50 p-2 rounded-[2rem] flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar">
          {[
            { id: 'approvals', icon: Check, label: 'Audit', count: pendingRequests.length },
            { id: 'vips', icon: Crown, label: 'VIPs', count: activeVips.length },
            { id: 'ledger', icon: Receipt, label: 'Ledger' },
            { id: 'referrals', icon: Users, label: 'Refs', count: pendingReferrals.length },
            { id: 'messages', icon: MessageSquare, label: 'Chat' },
            { id: 'broadcast', icon: Radio, label: 'Push' },
            { id: 'analytics', icon: BarChart3, label: 'Stats' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1.5 py-4 px-1 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? 'bg-[var(--accent)]/10' : 'hover:bg-zinc-800/40'}`}>
              <div className="relative"><tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${activeTab === tab.id ? 'gold-text scale-110 drop-shadow-[0_0_10px_var(--accent)]' : 'text-zinc-600'}`} />{tab.count !== undefined && tab.count > 0 && tab.id === 'approvals' && <span className="absolute -top-2 -right-2 flex h-4 w-4 rounded-full bg-red-500 text-[8px] items-center justify-center text-white font-black border-2 border-zinc-900">{tab.count}</span>}</div>
              <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'gold-text' : 'text-zinc-600'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedProof && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-3">
                {selectedProof.type === 'vip' ? <Receipt className="w-5 h-5 gold-text" /> : <CreditCard className="w-5 h-5 text-zinc-400" />}
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {selectedProof.type === 'vip' ? 'VIP SUBSCRIPTION AUDIT' : 'SESSION PAYMENT AUDIT'}
                </p>
              </div>
              <button onClick={() => setSelectedProof(null)} className="p-2.5 bg-zinc-800 rounded-full text-zinc-500"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] text-black font-mono space-y-6 border-t-[12px] border-[var(--accent)] relative overflow-hidden shadow-2xl text-center">
                <p className="font-black text-xl uppercase tracking-tighter border-b border-zinc-200 pb-4">CELEBRITY AUDIT</p>
                <div className="text-[10px] text-left space-y-2">
                  <div className="flex justify-between uppercase"><span className="text-zinc-400">Trace:</span> <span className="font-black">{selectedProof.userName}</span></div>
                  <div className="flex justify-between uppercase"><span className="text-zinc-400">Ref:</span> <span className="font-black">{selectedProof.proofOfPayment}</span></div>
                  {selectedProof.comment && <div className="bg-zinc-50 p-4 rounded-xl text-[10px] italic leading-relaxed text-zinc-500 mt-4">"{selectedProof.comment}"</div>}
                </div>
                <div className="border-t border-dashed border-zinc-300 pt-6 flex justify-between items-baseline">
                  <p className="text-[10px] font-black uppercase text-zinc-400">Sum</p>
                  <p className="text-4xl font-black">N{selectedProof.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Uploaded Image Simulation */}
              <div className="space-y-3">
                <p className="text-[8px] uppercase tracking-[0.3em] font-black text-zinc-600">CLIENT UPLOADED RECEIPT</p>
                <div className="aspect-[4/5] w-full bg-zinc-950 rounded-[2rem] border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 flex flex-col items-center justify-center p-8 text-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Digital Snapshot Attached</p>
                    <p className="text-[8px] text-zinc-600 mt-2 font-mono">{selectedProof.proofOfPayment}</p>
                  </div>
                  {/* Real implementation would show an <img> here */}
                  <div className="w-3/4 h-3/4 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-black/60 flex gap-4 shrink-0">
              <button onClick={() => { onReject(selectedProof.id); setSelectedProof(null); }} className="flex-1 py-5 bg-zinc-800 text-red-500 font-black rounded-2xl text-[10px] uppercase">Reject</button>
              <button onClick={() => { onApprove(selectedProof.id); setSelectedProof(null); }} className="flex-1 py-5 gold-gradient text-black font-black rounded-2xl text-[10px] uppercase shadow-2xl">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
