import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Shield } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ isOpen, onClose, room }) => {
  const [formData, setFormData] = useState({
    name: room.name,
    description: room.description || '',
    isPrivate: room.isPrivate || false,
    avatar: room.avatar || '💬'
  });
  const [loading, setLoading] = useState(false);
  const { updateRoom } = useStore();

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        description: room.description || '',
        isPrivate: room.isPrivate || false,
        avatar: room.avatar || '💬'
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Room name is required');

    try {
      setLoading(true);
      const res = await api.put(`/rooms/${room._id}`, formData);
      updateRoom(res.data);
      toast.success('Room updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (emoji: string) => {
    setFormData({ ...formData, avatar: emoji });
  };

  const emojis = ['💬', '🚀', '🔥', '💡', '🎨', '🎮', '🛠️', '📈', '🌍', '❤️'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl border border-white/10"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gradient">Edit Room</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Room Icon</label>
                <div className="flex flex-wrap gap-3">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAvatarSelect(emoji)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                        formData.avatar === emoji ? 'bg-gradient-primary shadow-glow-primary scale-110' : 'bg-background-primary border border-border hover:border-primary-from/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Room Name</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background-primary border border-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary-from transition-all"
                    placeholder="Engineering-Team"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background-primary border border-border rounded-xl p-4 h-24 focus:outline-none focus:border-primary-from transition-all resize-none text-sm"
                  placeholder="What is this room about?"
                />
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-error/20 rounded-xl flex items-center justify-center text-error">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Private Room</h4>
                    <p className="text-[10px] text-text-muted">Only invited members can join</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.isPrivate ? 'bg-error' : 'bg-border'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPrivate ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient py-4 rounded-xl font-bold shadow-glow-primary flex items-center justify-center gap-2 group"
              >
                {loading ? 'Updating...' : 'Save Changes'}
                {!loading && <X className="w-5 h-5 rotate-45 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditRoomModal;
