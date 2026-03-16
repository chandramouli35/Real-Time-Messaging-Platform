import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { X, Hash, Users, Shield, UserPlus, Globe, Bell, BellOff, LogOut, Trash2, Edit, Check, Calendar } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import EditRoomModal from './EditRoomModal';
import { format } from 'date-fns';

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ isOpen, onClose }) => {
  const { activeRoom, onlineUsers, user, updateRoom, deleteRoom, setUser } = useStore();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isMuteOptionsOpen, setIsMuteOptionsOpen] = React.useState(false);

  const isCreator = activeRoom?.createdBy === user?._id;
  const isMuted = user?.mutedRooms?.some(m => m.roomId === activeRoom?._id);

  const handleApprove = async (userId: string) => {
    try {
      const res = await api.post(`/rooms/${activeRoom?._id}/approve`, { userId });
      updateRoom(res.data);
      toast.success('User approved');
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const res = await api.post(`/rooms/${activeRoom?._id}/reject`, { userId });
      updateRoom(res.data);
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this room?')) return;
    try {
      await api.post(`/rooms/${activeRoom?._id}/leave`);
      deleteRoom(activeRoom?._id || '');
      toast.success('Left room');
      onClose();
    } catch (error) {
      toast.error('Failed to leave room');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('WARNING: This will delete the entire room and all messages. Continue?')) return;
    try {
      await api.delete(`/rooms/${activeRoom?._id}`);
      deleteRoom(activeRoom?._id || '');
      toast.success('Room deleted');
      onClose();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const handleMute = async (hours: number) => {
    try {
      const res = await api.post(`/rooms/${activeRoom?._id}/mute`, { hours });
      setUser({ ...user!, mutedRooms: res.data });
      toast.success(hours === 0 ? 'Muted always' : `Muted for ${hours} hours`);
      setIsMuteOptionsOpen(false);
    } catch (error) {
      toast.error('Failed to mute room');
    }
  };

  const handleUnmute = async () => {
    try {
      const res = await api.post(`/rooms/${activeRoom?._id}/unmute`);
      setUser({ ...user!, mutedRooms: res.data });
      toast.success('Unmuted');
    } catch (error) {
      toast.error('Failed to unmute room');
    }
  };

  if (!activeRoom) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full bg-background-secondary border-l border-border flex flex-col overflow-hidden hidden md:flex"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Hash className="w-5 h-5 text-text-muted" />
              Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-[260px]">
            {/* Room Info */}
            <div className="p-4 border-b border-border text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center text-4xl mb-4 overflow-hidden">
                {activeRoom.avatar.startsWith('data:') ? (
                  <img src={activeRoom.avatar} alt="room" className="w-full h-full object-cover" />
                ) : (
                  activeRoom.avatar || <Hash className="w-10 h-10 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-1">{activeRoom.name}</h3>
              <p className="text-sm text-text-muted mb-4">{activeRoom.description || 'No description provided.'}</p>

              <div className="flex items-center justify-center gap-4 text-xs text-text-muted w-full">
                <div className="flex flex-col items-center p-2 glass rounded-lg flex-1">
                  <Users className="w-4 h-4 mb-1 text-primary-from" />
                  <span>{activeRoom.members?.length || 0}</span>
                </div>
                <div className="flex flex-col items-center p-2 glass rounded-lg flex-1">
                  {activeRoom.isPrivate ? (
                    <Shield className="w-4 h-4 mb-1 text-error" />
                  ) : (
                    <Globe className="w-4 h-4 mb-1 text-success" />
                  )}
                  <span>{activeRoom.isPrivate ? 'Private' : 'Public'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 w-full">
                {isCreator ? (
                  <>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-2.5 rounded-xl bg-white/5 border border-border hover:bg-white/10 transition-all text-sm flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="p-2.5 rounded-xl bg-error/10 border border-error/20 hover:bg-error/20 transition-all text-sm text-error flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleLeave}
                    className="p-2.5 rounded-xl bg-error/10 border border-error/20 hover:bg-error/20 transition-all text-sm text-error flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Leave
                  </button>
                )}
                
                <div className="relative">
                  {isMuted ? (
                    <button 
                      onClick={handleUnmute}
                      className="p-2.5 rounded-xl bg-primary-from/10 border border-primary-from/20 hover:bg-primary-from/20 transition-all text-sm text-primary-from flex items-center gap-2"
                    >
                      <BellOff className="w-4 h-4" /> Unmute
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsMuteOptionsOpen(!isMuteOptionsOpen)}
                      className="p-2.5 rounded-xl bg-white/5 border border-border hover:bg-white/10 transition-all text-sm flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" /> Mute
                    </button>
                  )}
                  
                  {isMuteOptionsOpen && !isMuted && (
                    <div className="absolute top-full mt-2 right-0 w-40 glass rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden divide-y divide-white/5">
                      <button onClick={() => handleMute(1)} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors">1 Hour</button>
                      <button onClick={() => handleMute(2)} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors">2 Hours</button>
                      <button onClick={() => handleMute(0)} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors">Always</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Requests Section */}
            {isCreator && activeRoom.pendingMembers && activeRoom.pendingMembers.length > 0 && (
              <div className="p-4 border-b border-border bg-primary-from/5">
                <h4 className="text-xs uppercase font-bold text-primary-from mb-3 tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Pending Requests ({activeRoom.pendingMembers.length})
                </h4>
                <div className="space-y-3">
                  {activeRoom.pendingMembers.map((member: any) => (
                    <div key={member._id} className="flex items-center justify-between gap-2 p-2 glass rounded-xl border border-primary-from/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                           {member.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-text-primary truncate">{member.username}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleApprove(member._id)}
                          className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success hover:text-white transition-all transform hover:scale-110"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleReject(member._id)}
                          className="p-1.5 rounded-lg bg-error/20 text-error hover:bg-error hover:text-white transition-all transform hover:scale-110"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4">
              <h4 className="text-xs uppercase font-bold text-text-muted mb-4 tracking-wider">Members</h4>
              <div className="space-y-3">
                {activeRoom.members?.map((member: any) => {
                  const isOnline = onlineUsers.includes(member._id);
                  return (
                    <div key={member._id} className="flex items-center gap-3">
                      <div className="relative">
                        {member.avatar?.startsWith('data:') ? (
                          <img src={member.avatar} className="w-8 h-8 rounded-full object-cover border border-border" alt={member.username} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold">
                            {member.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background-secondary ${isOnline ? 'bg-success' : 'bg-text-muted'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{member.username}</p>
                        <p className="text-xs text-text-muted truncate">
                          {isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="text-xs text-text-muted flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Created {format(new Date(activeRoom.createdAt || Date.now()), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeRoom && (
        <EditRoomModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          room={activeRoom}
        />
      )}
    </AnimatePresence>
  );
};

export default RightPanel;
