import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Search, Star, MessageSquare } from 'lucide-react';

const MessagesPage = ({ defaultRecipient }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Poll for new messages every 3 seconds to simulate real-time
  useEffect(() => {
    fetchConversations();
    
    const interval = setInterval(() => {
      fetchConversations();
      if (activeChat) {
        fetchMessages(activeChat.roomId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChat]);

  // Handle default recipient redirection (e.g. from BidComparisonView "Chat" button)
  useEffect(() => {
    if (defaultRecipient) {
      handleSelectRecipient(defaultRecipient);
    }
  }, [defaultRecipient]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (err) {
      console.error('Error fetching conversations list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const res = await fetch(`/api/messages/room/${roomId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat.roomId);
  };

  const handleSelectRecipient = async (recipientUser) => {
    // Check if conversation already exists
    const roomId = [user._id, recipientUser._id].sort().join('-');
    const existing = conversations.find(c => c.roomId === roomId);
    
    if (existing) {
      setActiveChat(existing);
      fetchMessages(roomId);
    } else {
      // Create a temporary conversation object
      const tempChat = {
        roomId,
        otherUser: recipientUser,
        lastMessage: 'Starting conversation...',
        lastMessageTime: new Date()
      };
      setActiveChat(tempChat);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat) return;

    const recipientId = activeChat.otherUser._id;
    const msgText = typedMessage;
    setTypedMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: recipientId,
          messageText: msgText
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        // Refresh conversations list to update last message snippet
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex max-w-7xl mx-auto border-l border-r border-darkBg-border/40 overflow-hidden">
      {/* Left Pane: Conversations List */}
      <div className="w-80 bg-[#121426] border-r border-darkBg-border flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-darkBg-border space-y-3">
          <h3 className="text-base font-bold text-white">Conversations</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 bg-darkBg border border-darkBg-border rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-darkBg-border/30">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No active chats found.</div>
          ) : (
            conversations.map((chat) => {
              const isSelected = activeChat?.roomId === chat.roomId;
              return (
                <button
                  key={chat.roomId}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-all ${
                    isSelected ? 'bg-darkBg-hover border-l-4 border-brand' : 'hover:bg-darkBg-hover/30'
                  }`}
                >
                  <img
                    src={chat.otherUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.otherUser?.name}`}
                    alt={chat.otherUser?.name}
                    className="w-10 h-10 rounded-xl object-cover border border-darkBg-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-white truncate">{chat.otherUser?.businessName || chat.otherUser?.name}</h4>
                      <span className="text-[9px] text-slate-500 whitespace-nowrap">{formatTime(chat.lastMessageTime)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate pr-2">{chat.lastMessage}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Window */}
      <div className="flex-1 bg-darkBg flex flex-col h-full">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 bg-[#121426] border-b border-darkBg-border flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <img
                  src={activeChat.otherUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${activeChat.otherUser?.name}`}
                  alt={activeChat.otherUser?.name}
                  className="w-9 h-9 rounded-xl object-cover border border-darkBg-border"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {activeChat.otherUser?.businessName || activeChat.otherUser?.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400">{activeChat.otherUser?.role}</span>
                    {activeChat.otherUser?.role === 'Seller' && (
                      <span className="flex items-center gap-0.5 bg-yellow-500/10 text-yellow-400 px-1 rounded text-[8px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" /> {activeChat.otherUser?.rating || 5.0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender._id === user._id || msg.sender === user._id;
                return (
                  <div 
                    key={msg._id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.sender?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.name}`}
                        alt={msg.sender?.name}
                        className="w-7 h-7 rounded-lg object-cover border border-darkBg-border/80 flex-shrink-0 mb-1"
                      />
                    )}
                    <div className="max-w-[70%] space-y-1">
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-brand text-white rounded-br-none shadow-md shadow-brand/10' 
                          : 'bg-[#121426] border border-darkBg-border text-slate-300 rounded-bl-none'
                      }`}>
                        {msg.messageText}
                      </div>
                      <span className={`text-[9px] text-slate-500 block ${isMe ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.createdAt || new Date())}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#121426] border-t border-darkBg-border flex gap-3 items-center">
              <input
                type="text"
                required
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-xs text-white focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-10 h-10 bg-brand hover:bg-brand-hover text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs gap-3">
            <MessageSquare className="w-12 h-12 text-slate-600" />
            <span>Select a conversation to start messaging.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
