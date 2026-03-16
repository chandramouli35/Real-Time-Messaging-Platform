import { useEffect, useState } from 'react';
import { PanelRightClose, PanelRightOpen, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useStore } from '../store/useStore';
import { initSocket, getSocket, disconnectSocket } from '../socket/socket';

import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import RightPanel from '../components/RightPanel';
import CreateRoomModal from '../components/CreateRoomModal';

const Chat = () => {
  const { 
    user, 
    rooms,
    activeRoom, 
    setRooms, 
    setMessages, 
    addMessage,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
    updateRoomPreview,
    updateRoom,
    deleteRoom
  } = useStore();
  
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.token) return;

    // Fetch initial data
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data);
      } catch (error) {
        console.error('Failed to fetch rooms', error);
      }
    };

    fetchRooms();

    // Init Socket
    const socket = initSocket(user.token);

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('user_online', (userId: string) => {
      addOnlineUser(userId);
    });

    socket.on('user_offline', (userId: string) => {
      removeOnlineUser(userId);
    });

    socket.on('message_received', (message: any) => {
      if (message.roomId === activeRoom?._id) {
        addMessage(message);
      } else {
         // Could show toast for other rooms
         updateRoomPreview(message.roomId, message.content);
      }
    });

    socket.on('user_typing', ({ username, roomId }) => {
      addTypingUser(roomId, username);
    });

    socket.on('user_stop_typing', ({ username, roomId }) => {
      removeTypingUser(roomId, username);
    });

    socket.on(`notification_${user._id}`, (data: any) => {
      if (data.type === 'REQUEST_APPROVED') {
        const room = data.room;
        // Check if room already exists in sidebar
        if (!rooms.some(r => r._id === room._id)) {
          setRooms([room, ...rooms]);
          toast.success(`You've been approved to join ${room.name}!`);
        }
      } else if (data.type === 'JOIN_REQUEST') {
        toast((_t) => (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-widest text-primary-from">Join Request</span>
              <span className="text-sm"><b>{data.username}</b> wants to join <b>{data.roomName}</b></span>
            </div>
          </div>
        ), { duration: 5000, icon: '👤' });
      }
    });

    socket.on('room_updated', (updatedRoom: any) => {
      updateRoom(updatedRoom);
      if (activeRoom?._id === updatedRoom._id) {
        toast.success('Room details updated');
      }
    });

    socket.on('room_deleted', (roomId: string) => {
      deleteRoom(roomId);
      toast.error('A room was deleted by the admin');
    });

    socket.on('error', (err: string) => {
      toast.error(err);
    });

    return () => {
      disconnectSocket();
    };
  }, [user, activeRoom]);

  useEffect(() => {
    if (!activeRoom || !user?.token) return;

    // Join room socket room
    const socket = getSocket();
    if (socket) {
       socket.emit('join_room', activeRoom._id);
    }
    
    // Fetch messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/rooms/${activeRoom._id}/messages`);
        setMessages(res.data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };
    
    fetchMessages();

    // Cleanup: leave room
    return () => {
       if (socket) {
          socket.emit('leave_room', activeRoom._id);
       }
    }
  }, [activeRoom, user]);


  return (
    <div className="h-screen flex bg-background-primary overflow-hidden">
      {/* Mobile sidebar overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 h-full transition-transform duration-300 ease-in-out`}>
        <Sidebar onCreateRoomClick={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center p-3 glass-card border-b border-border shadow-sm z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-3 rounded-lg bg-background-secondary text-text-primary hover:bg-white/10"
          >
            <Hash className="w-5 h-5" />
          </button>
          <div className="font-bold flex-1 truncate">{activeRoom?.name || 'NexChat'}</div>
          
          {activeRoom && (
            <button 
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className="p-2 ml-3 rounded-lg bg-background-secondary text-text-primary hover:bg-white/10"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat Component */}
        <div className="flex-1 relative h-full flex flex-col overflow-hidden">
             
           {/* Floating button for right panel if closed (Desktop only) */}
           {activeRoom && !isRightPanelOpen && (
              <button 
                onClick={() => setIsRightPanelOpen(true)}
                className="hidden md:flex absolute top-4 right-4 z-20 p-2.5 glass rounded-xl text-text-muted hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-x-1 border border-border"
                title="Toggle Right Panel"
              >
                <PanelRightClose className="w-5 h-5" />
              </button>
           )}

           <ChatWindow />
        </div>
      </div>

      {/* Right Details Panel */}
      <RightPanel 
        isOpen={isRightPanelOpen} 
        onClose={() => setIsRightPanelOpen(false)} 
      />

      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Chat;
