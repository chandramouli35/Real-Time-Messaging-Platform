import { create } from 'zustand';

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status: string;
  token?: string;
  mutedRooms?: Array<{ roomId: string, until: string | null }>;
}

export interface Room {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  avatar: string;
  createdBy: string;
  members: any[];
  pendingMembers: any[];
  updatedAt: string;
  createdAt: string;
  unreadCount?: number;
  lastMessage?: string;
}

export interface Message {
  _id: string;
  roomId: string;
  senderId: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  type: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
  readBy: string[];
  isOptimistic?: boolean;
}

interface AppState {
  user: User | null;
  rooms: Room[];
  activeRoom: Room | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: { [roomId: string]: string[] };
  
  setUser: (user: User | null) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  setActiveRoom: (room: Room | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  addTypingUser: (roomId: string, username: string) => void;
  removeTypingUser: (roomId: string, username: string) => void;
  updateRoomPreview: (roomId: string, lastMessage: string) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  rooms: [],
  activeRoom: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [room, ...state.rooms] })),
  
  setActiveRoom: (room) => set({ activeRoom: room }),
  
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    // 1. If it's already in state by ID, just ignore
    if (state.messages.some(m => m._id === message._id)) {
      return state;
    }

    // 2. If it's a REAL message (not optimistic), try to find a matching optimistic message to replace
    if (!message.isOptimistic) {
      const optimisticIndex = state.messages.findIndex(m => 
        m.isOptimistic && 
        m.senderId._id === message.senderId._id && 
        (m.content === message.content || (m.fileUrl && m.fileUrl === message.fileUrl))
      );

      if (optimisticIndex !== -1) {
        const newMessages = [...state.messages];
        newMessages[optimisticIndex] = message; // Replace the temporary message with the real one
        return { messages: newMessages };
      }
    }

    // 3. Otherwise just append to the end
    return { messages: [...state.messages, message] };
  }),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (userId) => set((state) => ({ 
    onlineUsers: state.onlineUsers.includes(userId) ? state.onlineUsers : [...state.onlineUsers, userId] 
  })),
  removeOnlineUser: (userId) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(id => id !== userId)
  })),
  
  addTypingUser: (roomId, username) => set((state) => {
    const roomPms = state.typingUsers[roomId] || [];
    if (!roomPms.includes(username)) {
      return { typingUsers: { ...state.typingUsers, [roomId]: [...roomPms, username] } };
    }
    return state;
  }),
  removeTypingUser: (roomId, username) => set((state) => {
    const roomPms = state.typingUsers[roomId] || [];
    return { typingUsers: { ...state.typingUsers, [roomId]: roomPms.filter(u => u !== username) } };
  }),
  
  updateRoomPreview: (roomId, lastMessage) => set((state) => ({
    rooms: state.rooms.map(r => r._id === roomId ? { ...r, lastMessage } : r)
  })),

  updateRoom: (room) => set((state) => ({
    rooms: state.rooms.map(r => r._id === room._id ? room : r),
    activeRoom: state.activeRoom?._id === room._id ? room : state.activeRoom
  })),

  deleteRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter(r => r._id !== roomId),
    activeRoom: state.activeRoom?._id === roomId ? null : state.activeRoom
  })),
}));
