import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Hash, Search, Info, Send, Image as ImageIcon, Smile, MoreVertical, Loader2, Compass } from 'lucide-react';
import DiscoverRoomsModal from './DiscoverRoomsModal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getSocket } from '../socket/socket';
// Use Message interface from store via useStore
import { useStore, type Message } from '../store/useStore';

const ChatWindow = () => {
  const { activeRoom, user, messages, typingUsers, addMessage } = useStore();
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  let typingTimeout: any = null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (fileData?: { fileUrl: string, fileType: string }) => {
    if ((!inputText.trim() && !fileData) || !activeRoom || !user) return;
    
    const socket = getSocket();
    if (socket) {
      const messageData = { 
        roomId: activeRoom._id, 
        content: inputText.trim(),
        fileUrl: fileData?.fileUrl || '',
        fileType: fileData?.fileType || ''
      };

      // 1. Optimistic UI Update
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        roomId: activeRoom._id,
        senderId: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar
        },
        content: messageData.content,
        fileUrl: messageData.fileUrl,
        fileType: messageData.fileType,
        type: 'text',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        readBy: [user._id]
      };
      
      addMessage(optimisticMessage);

      // 2. Emit via socket
      socket.emit('send_message', messageData);
      socket.emit('typing_stop', activeRoom._id);
      setIsTyping(false);
    }
    
    setInputText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoom) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Send the file as a message
      handleSend({ 
        fileUrl: res.data.fileUrl, 
        fileType: res.data.fileType 
      });
      
      toast.success('File uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (!activeRoom) return;
    
    const socket = getSocket();
    if (!socket) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', activeRoom._id);
    }
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', activeRoom._id);
    }, 2000);
  };

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-primary h-full relative overflow-hidden">
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary-from/10 blur-[100px] pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-from/10 blur-[120px] pointer-events-none"
        />
        
        <div className="z-10 text-center flex flex-col items-center max-w-md">
          <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center text-5xl mb-6 shadow-glow-primary">
            👋
          </div>
          <h2 className="text-3xl font-bold mb-3 text-gradient">Select a Room</h2>
          <p className="text-text-muted mb-6">Choose an existing room from the sidebar or create a new one to start chatting with your team.</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setIsDiscoverOpen(true)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 group"
            >
              <Compass className="w-5 h-5 text-primary-from group-hover:rotate-12 transition-transform" />
              <span>Discover Public Rooms</span>
            </button>
          </div>
        </div>

        <DiscoverRoomsModal 
          isOpen={isDiscoverOpen} 
          onClose={() => setIsDiscoverOpen(false)} 
        />
      </div>
    );
  }

  const currentTypingUsers = typingUsers[activeRoom._id] || [];
  const otherTypingUsers = currentTypingUsers.filter(u => u !== user?.username);

  return (
    <div className="flex-1 flex flex-col h-full bg-background-primary relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*,video/*"
      />
      
      {/* Header */}
      <div className="h-16 px-6 glass flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary shadow-glow-primary flex items-center justify-center overflow-hidden">
            {activeRoom.avatar.startsWith('data:') ? (
               <img src={activeRoom.avatar} alt="room" className="w-full h-full object-cover" />
            ) : (
               <span className="text-white text-xl">{activeRoom.avatar || <Hash className="w-5 h-5 text-white" />}</span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
              {activeRoom.name}
              {activeRoom.isPrivate && <span className="text-xs bg-error/20 text-error px-1.5 py-0.5 rounded ml-2">Private</span>}
            </h2>
            <p className="text-xs text-text-muted flex items-center gap-1">
              {activeRoom.members?.length || 0} members <span className="w-1 h-1 rounded-full bg-border inline-block mx-1"></span> {currentTypingUsers.length > 0 ? `${currentTypingUsers.length} typing...` : 'Active now'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors md:hidden">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mb-4">
              <span className="text-4xl">💭</span>
            </div>
            <h3 className="text-xl font-bold mb-2">It's quiet in here</h3>
            <p className="text-text-muted text-sm">Be the first to break the ice and start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId?._id === user?._id;
            const isSystem = msg.type === 'system';
            const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId?._id !== msg.senderId?._id);

            if (isSystem) {
              return (
                <div key={msg._id} className="flex justify-center my-4">
                  <span className="bg-background-secondary text-text-muted text-xs px-3 py-1 rounded-full border border-border">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg._id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group ${msg.isOptimistic ? 'opacity-70' : ''}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 mt-auto mb-1 flex items-center justify-center bg-gradient-accent text-xs font-bold text-white overflow-hidden relative">
                    {showAvatar ? (
                      msg.senderId?.avatar?.startsWith('data:') ? (
                        <img src={msg.senderId.avatar} className="w-full h-full object-cover" alt={msg.senderId.username} />
                      ) : (
                        msg.senderId?.username?.substring(0, 2).toUpperCase()
                      )
                    ) : null}
                  </div>
                )}
                
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showAvatar && !isMe && (
                    <span className="text-xs text-text-muted ml-1 mb-1">{msg.senderId?.username}</span>
                  )}
                  
                  <div className="flex items-end gap-2">
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-text-muted">
                        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
                        <span className="text-[10px] whitespace-nowrap">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                      </div>
                    )}
                    
                    <div 
                      className={`px-1 py-1 rounded-2xl relative overflow-hidden ${
                        isMe 
                          ? 'bg-gradient-primary text-white rounded-br-sm shadow-[0_4px_14px_0_rgba(99,102,241,0.2)]' 
                          : 'bg-background-secondary text-text-primary border border-border rounded-bl-sm'
                      }`}
                    >
                      {msg.fileUrl && (
                        <div className="mb-1 rounded-xl overflow-hidden max-w-[400px]">
                          {msg.fileType === 'image' && (
                            <img 
                              src={msg.fileUrl.startsWith('data:') ? msg.fileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${msg.fileUrl}`} 
                              alt="attachment" 
                              className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                              onClick={() => window.open(msg.fileUrl.startsWith('data:') ? msg.fileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${msg.fileUrl}`, '_blank')}
                            />
                          )}
                          {msg.fileType === 'video' && (
                            <video 
                              src={msg.fileUrl.startsWith('data:') ? msg.fileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${msg.fileUrl}`} 
                              controls 
                              className="w-full h-auto max-h-[300px]"
                            />
                          )}
                          {msg.fileType !== 'image' && msg.fileType !== 'video' && (
                            <a 
                              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${msg.fileUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 transition-all rounded-xl border border-white/5"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary-from/20 flex items-center justify-center">
                                <Send className="w-5 h-5 text-primary-from rotate-90" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">Download Attachment</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest">{msg.fileType || 'FILE'}</p>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.content && <p className="px-3 py-1.5 text-sm md:text-base break-words whitespace-pre-wrap">{msg.content}</p>}
                    </div>

                    {!isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-text-muted">
                        <span className="text-[10px] whitespace-nowrap">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Typing Indicator area */}
        {otherTypingUsers.length > 0 && (
          <div className="flex items-center gap-3 text-text-muted text-xs p-2">
            <div className="flex bg-background-secondary px-3 py-2 rounded-full border border-border">
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full mx-0.5 animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full mx-0.5 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full mx-0.5 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <span>{otherTypingUsers.join(', ')} {otherTypingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center gap-2 text-primary-from text-xs p-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending media...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background-primary border-t border-border z-10 w-full glass">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-text-muted hover:text-white transition-colors rounded-xl hover:bg-white/5 h-12 flex items-center justify-center"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative flex items-center bg-background-secondary border border-border rounded-2xl overflow-hidden focus-within:border-primary-from/50 transition-colors">
            <button className="absolute left-3 p-1.5 text-text-muted hover:text-accent-from transition-colors pointer-events-auto z-10">
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Press Enter to send)"
              className="w-full bg-transparent border-none text-text-primary text-sm md:text-base pl-12 pr-4 py-3.5 focus:outline-none focus:ring-0 placeholder:text-text-muted"
            />
          </div>

          <button 
            onClick={() => handleSend()}
            disabled={!inputText.trim() && !isUploading}
            className={`p-3 rounded-2xl transition-all duration-300 h-12 w-12 flex items-center justify-center
              ${(inputText.trim() || isUploading)
                ? 'bg-gradient-primary shadow-glow-primary text-white cursor-pointer hover:scale-105' 
                : 'bg-background-secondary border border-border text-text-muted cursor-not-allowed'
              }`
            }
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
