import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, LogOut, Settings, Hash, Compass } from 'lucide-react';
import DiscoverRoomsModal from './DiscoverRoomsModal';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onCreateRoomClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCreateRoomClick }) => {
  const { user, rooms, activeRoom, setActiveRoom, setUser } = useStore();
  const navigate = useNavigate();
  const [isDiscoverOpen, setIsDiscoverOpen] = React.useState(false);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="w-full md:w-[280px] h-full bg-background-secondary border-r border-border flex flex-col pt-4">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <h1 className="text-xl font-bold font-sans">NexChat</h1>
        </div>
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-muted" />
          </div>
          <input 
            type="text" 
            className="w-full bg-background-primary border border-border text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-primary-from transition-colors"
            placeholder="Search rooms..."
          />
        </div>

        <div className="flex gap-2 mb-2">
          <button 
            onClick={onCreateRoomClick}
            className="flex-1 btn-gradient py-2 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
          <button 
            onClick={() => setIsDiscoverOpen(true)}
            className="px-4 bg-background-primary border border-border rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center text-text-muted hover:text-white"
            title="Discover Rooms"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {rooms.map(room => (
          <motion.div 
            key={room._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveRoom(room)}
            className={`w-full text-left p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 relative ${
              activeRoom?._id === room._id 
                ? 'bg-white/5 shadow-[inset_2px_0_0_#6366f1]' 
                : 'hover:bg-white/5'
            }`}
          >
            <div className="min-w-[40px] h-10 rounded-full flex items-center justify-center text-xl bg-background-primary overflow-hidden">
              {room.avatar.startsWith('data:') ? (
                <img src={room.avatar} alt="room" className="w-full h-full object-cover" />
              ) : (
                room.avatar || <Hash className="w-5 h-5 text-text-muted" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm truncate pr-2 text-text-primary">
                  {room.name}
                </span>
              </div>
              <p className="text-xs text-text-muted truncate">
                {room.lastMessage || (room.isPrivate ? 'Private Room' : 'Public Room')}
              </p>
            </div>
            {/* Unread dot simulation */}
            {activeRoom?._id !== room._id && Math.random() > 0.7 && (
              <div className="w-2 h-2 rounded-full bg-primary-from absolute right-4 top-1/2 -mt-1"></div>
            )}
          </motion.div>
        ))}
        {rooms.length === 0 && (
          <div className="text-center p-4 text-text-muted text-sm mt-10">
            No rooms yet. Create one!
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="px-4 py-4 bg-background-card border-t border-border mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3 truncate pr-2">
          <div className="relative">
            {user?.avatar?.startsWith('data:') ? (
              <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-background-primary" alt="avatar" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background-primary"></div>
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold truncate text-text-primary">{user?.username}</h4>
            <span className="text-xs text-success flex items-center gap-1">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-error transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <DiscoverRoomsModal 
        isOpen={isDiscoverOpen} 
        onClose={() => setIsDiscoverOpen(false)} 
      />
    </div>
  );
};

export default Sidebar;
