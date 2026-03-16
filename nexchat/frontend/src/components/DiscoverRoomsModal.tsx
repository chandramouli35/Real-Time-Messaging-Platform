import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Search, Plus, Hash, Users as UsersIcon } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
// import { useStore } from '../store/useStore';

interface DiscoverRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiscoverRoomsModal: React.FC<DiscoverRoomsModalProps> = ({ isOpen, onClose }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // const { addRoom, setActiveRoom } = useStore();

  useEffect(() => {
    if (isOpen) {
      fetchDiscoverRooms();
    }
  }, [isOpen]);

  const fetchDiscoverRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms/discover');
      setRooms(res.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (roomId: string) => {
    try {
      await api.post(`/rooms/${roomId}/join`);
      toast.success('Join request sent to admin');
      // Update local state to show "Requested"
      setRooms(rooms.map(r => r._id === roomId ? { ...r, requested: true } : r));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-md rounded-[1.5rem] overflow-hidden relative z-10 flex flex-col max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary shrink-0">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-black tracking-tight text-white uppercase truncate">
                      Discover
                    </h2>
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest opacity-40 truncate">
                      Public Spaces
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all active:scale-95 shrink-0"
                >
                  <X className="w-5 h-5 text-text-muted hover:text-white" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-5 py-3 bg-white/[0.01] border-b border-white/5">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary-from" />
                <input
                  type="text"
                  placeholder="Find a community..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background-primary border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-from/50 transition-all text-xs placeholder:text-text-muted/30"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center py-10">
                  <div className="w-10 h-10 border-2 border-primary-from/30 border-t-primary-from rounded-full animate-spin mb-3" />
                  <span className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase opacity-40">Loading...</span>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5 mx-auto">
                    <Hash className="w-6 h-6 text-white/10" />
                  </div>
                  <h3 className="text-base font-bold text-white">No spaces found</h3>
                  <p className="text-text-muted text-[10px] sm:text-xs mt-1 max-w-[160px] mx-auto leading-relaxed opacity-40">Try a different name or create your own hub!</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <motion.div
                    layout
                    key={room._id}
                    className="flex flex-col gap-3 p-4 glass rounded-2xl border border-white/5 hover:border-primary-from/20 transition-all duration-300 group bg-white/[0.01]"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-from to-primary-to p-[1px] shrink-0">
                        <div className="w-full h-full rounded-xl bg-background-secondary flex items-center justify-center text-xl overflow-hidden shadow-xl">
                          {room.avatar.startsWith('data:') ? (
                            <img src={room.avatar} alt="room" className="w-full h-full object-cover" />
                          ) : (
                            room.avatar
                          )}
                        </div>
                      </div>

                      {/* Title & Count */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-primary-from transition-colors uppercase tracking-tight">
                          {room.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <UsersIcon className="w-3 h-3 text-primary-from opacity-60" />
                          <span className="text-[9px] font-black text-primary-from uppercase tracking-widest leading-none">
                            {room.members?.length || 0} Members
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desc */}
                    <p className="text-[11px] text-text-muted/60 line-clamp-2 leading-relaxed font-medium">
                      {room.description || 'Welcome to this public space! Join us to start collaborating.'}
                    </p>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="min-w-0 pr-2">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-30">Owner</span>
                        <p className="text-[10px] font-bold text-text-primary truncate">@{room.createdBy?.username}</p>
                      </div>

                      <button
                        disabled={room.requested}
                        onClick={() => handleJoinRequest(room._id)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all duration-300 active:scale-95 uppercase tracking-widest shrink-0 ${
                          room.requested 
                            ? 'bg-white/5 text-text-muted border border-white/5 cursor-not-allowed' 
                            : 'bg-primary-from text-white shadow-glow-primary hover:bg-primary-to'
                        }`}
                      >
                        {room.requested ? 'Pending' : 'Join'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* End results */}
            <div className="px-5 py-3 text-center bg-white/[0.02] border-t border-white/5">
              <span className="text-[8px] font-black text-text-muted tracking-[0.5em] uppercase opacity-20">
                End Results
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DiscoverRoomsModal;
