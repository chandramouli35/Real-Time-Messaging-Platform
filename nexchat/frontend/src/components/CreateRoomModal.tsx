import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Info, Lock, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useStore } from '../store/useStore';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_LIST = ['💬', '🚀', '🔥', '💡', '🌟', '🎮', '🎵', '⚽', '🍕', '💻', '📈', '🎉'];

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { addRoom, setActiveRoom } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    avatar: '💬'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === 'checkbox';
    const val = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Room name is required');

    try {
      setLoading(true);
      const res = await api.post('/rooms/create', formData);
      addRoom(res.data);
      setActiveRoom(res.data);
      toast.success('Room created successfully');
      setFormData({ name: '', description: '', isPrivate: false, avatar: '💬' });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card w-full max-w-md rounded-2xl p-6 relative z-50 shadow-2xl overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Hash className="w-6 h-6 text-primary-from" />
                  Create Room
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Avatar Picker */}
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-2">Room Icon</label>
                  <div className="flex gap-2 p-2 bg-background-secondary rounded-xl border border-border overflow-x-auto scrollbar-hide snap-x">
                    {EMOJI_LIST.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: emoji })}
                        className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl transition-all duration-200 snap-center ${
                          formData.avatar === emoji 
                            ? 'bg-gradient-primary shadow-glow-primary scale-110' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Room Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="w-4 h-4 text-text-muted" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. engineering, general"
                      className="input-glass w-full pl-9 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Description <span className="text-text-muted text-xs font-normal">(optional)</span></label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Info className="w-4 h-4 text-text-muted" />
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What is this channel about?"
                      className="input-glass w-full pl-9 py-2 min-h-[80px] resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-sm font-medium text-text-secondary block">Privacy</label>
                  
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${!formData.isPrivate ? 'border-primary-from bg-primary-from/5' : 'border-border hover:bg-white/5'}`}>
                    <input 
                      type="radio" 
                      name="privacy" 
                      className="mt-1" 
                      checked={!formData.isPrivate} 
                      onChange={() => setFormData({ ...formData, isPrivate: false })} 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium text-text-primary mb-0.5">
                        <Globe className="w-4 h-4 text-success" /> Public Room
                      </div>
                      <p className="text-xs text-text-muted">Anyone in your workspace can view and join this room.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.isPrivate ? 'border-primary-from bg-primary-from/5' : 'border-border hover:bg-white/5'}`}>
                    <input 
                      type="radio" 
                      name="privacy" 
                      className="mt-1" 
                      checked={formData.isPrivate} 
                      onChange={() => setFormData({ ...formData, isPrivate: true })} 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium text-text-primary mb-0.5">
                        <Lock className="w-4 h-4 text-error" /> Private Room
                      </div>
                      <p className="text-xs text-text-muted">Only invited members can view and join this room.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-gradient px-6 py-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateRoomModal;
