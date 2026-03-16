const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware for auth
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.username} (${userId})`);

    // Update user status
    await User.findByIdAndUpdate(userId, { status: 'online' });
    socket.broadcast.emit('user_online', userId);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.username} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.username} left room ${roomId}`);
    });

    socket.on('send_message', async ({ roomId, content, fileUrl, fileType }) => {
      try {
        const newMessage = new Message({
          roomId,
          senderId: userId,
          content,
          fileUrl: fileUrl || '',
          fileType: fileType || '',
          readBy: [userId]
        });

        const savedMessage = await newMessage.save();
        
        const populatedMessage = await Message.findById(savedMessage._id)
          .populate('senderId', 'username avatar');

        io.to(roomId).emit('message_received', populatedMessage);
      } catch (err) {
        socket.emit('error', 'Could not send message');
      }
    });

    socket.on('typing_start', (roomId) => {
      socket.to(roomId).emit('user_typing', { username: socket.user.username, roomId });
    });

    socket.on('typing_stop', (roomId) => {
      socket.to(roomId).emit('user_stop_typing', { username: socket.user.username, roomId });
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username} (${userId})`);
      await User.findByIdAndUpdate(userId, { 
        status: 'offline',
        lastSeen: new Date()
      });
      socket.broadcast.emit('user_offline', userId);
    });
  });

  return io;
};

module.exports = initSocket;
