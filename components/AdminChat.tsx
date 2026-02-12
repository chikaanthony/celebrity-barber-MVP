import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Send, 
  MessageSquare, 
  Plus, 
  ArrowLeft,
  Search
} from 'lucide-react';
import { Conversation, ChatMessage, User } from '../types';

interface AdminChatProps {
  conversations: Conversation[];
  users: User[];
  onSendMessage: (userId: string, text: string) => void;
  onMarkAsRead: (userId: string) => void;
  onBack: () => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ 
  conversations = [], 
  users = [],
  onSendMessage, 
  onMarkAsRead,
  onBack
}) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSelectingNewClient, setIsSelectingNewClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.userId === activeConversationId);

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

  return (
    <div className="relative min-h-screen flex flex-col pb-32 animate-slideUp">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 mb-6 pt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-black shadow-xl shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-luxury gold-text uppercase">Direct Client Channel</h1>
            <p className="text-[8px] text-zinc-500 uppercase tracking-[0.4em] font-black">Elite Communication Hub</p>
          </div>
        </div>
        <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[10px] font-mono font-bold text-zinc-400">{conversations.length} Active Channels</span>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="relative z-20 flex-1 px-4">
        <div className="rounded-[2.5rem] overflow-hidden border border-zinc-800/50 bg-black/40 backdrop-blur-xl min-h-[calc(100vh-200px)] flex flex-col">
          
          {activeConversationId ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-6 border-b border-zinc-800/50 bg-black/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4 mx-auto w-full max-w-2xl">
                  <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black shadow-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeConversation?.userName || 'Direct Channel'}</h4>
                    <p className="text-[7px] text-zinc-500 uppercase tracking-widest font-black">Direct Secure Channel</p>
                  </div>
                  <button 
                    onClick={() => setActiveConversationId(null)}
                    className="ml-auto p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
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

              {/* Reply Input */}
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
            <div className="flex flex-col md:flex-row h-full">
              {/* Client List Sidebar */}
              <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-zinc-800/50 bg-black/20 overflow-y-auto scrollbar-hide shrink-0">
                <div className="p-6 sticky top-0 bg-black/60 backdrop-blur-md z-10 border-b border-zinc-800/50 flex flex-col gap-4">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] gold-text">Conversations</h3>
                  <button 
                    onClick={() => setIsSelectingNewClient(!isSelectingNewClient)} 
                    className="flex items-center justify-center gap-2 p-3 gold-gradient rounded-xl text-black hover:rotate-90 transition-transform font-bold text-[10px] uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4" /> New Channel
                  </button>
                </div>
                
                {isSelectingNewClient ? (
                  <div className="p-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text" 
                        placeholder="Search clients..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:border-[var(--accent)] transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[7px] uppercase tracking-widest font-black text-zinc-500 px-4">Select Client</p>
                      {filteredUsers.map(u => (
                        <button 
                          key={u.id} 
                          onClick={() => { setActiveConversationId(u.id); setIsSelectingNewClient(false); }} 
                          className="w-full p-4 text-left rounded-xl hover:bg-[var(--accent)]/10 text-xs font-bold text-zinc-300 flex items-center gap-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white">{u.name}</p>
                            <p className="text-[8px] text-zinc-600 uppercase">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-y-auto scrollbar-hide">
                    {conversations.length > 0 ? (
                      conversations.map(conv => (
                        <button 
                          key={conv.userId} 
                          onClick={() => setActiveConversationId(conv.userId)} 
                          className={`w-full p-6 text-left transition-all relative border-b border-zinc-800/30 ${conv.unreadCount > 0 ? 'bg-[var(--accent)]/5' : 'hover:bg-zinc-800/30'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold text-sm shrink-0">
                              {conv.userName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <p className={`font-bold text-xs ${conv.unreadCount > 0 ? 'text-white' : 'text-zinc-500'}`}>{conv.userName}</p>
                                {conv.unreadCount > 0 && <span className="bg-red-500 text-[7px] font-black px-1.5 py-0.5 rounded-full">{conv.unreadCount}</span>}
                              </div>
                              <p className={`text-[9px] truncate ${conv.unreadCount > 0 ? 'text-[var(--accent)] font-bold' : 'text-zinc-700'}`}>{conv.lastMessage}</p>
                              <p className="text-[7px] text-zinc-600 uppercase mt-1">{conv.timestamp}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-zinc-800" />
                        <p className="text-[10px] uppercase tracking-widest font-black text-zinc-600">No Active Conversations</p>
                        <p className="text-[8px] text-zinc-700 mt-2">Start a channel with a client</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Empty State */}
              <div className="hidden md:flex flex-1 flex-col items-center justify-center opacity-10 p-12 text-center">
                <MessageSquare className="w-24 h-24 mb-6" />
                <p className="text-lg font-black uppercase tracking-[0.5em]">Direct Client Transmission</p>
                <p className="text-[12px] mt-4 uppercase tracking-widest">Select a channel to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
