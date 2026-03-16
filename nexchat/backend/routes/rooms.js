const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/rooms
// @desc    Get all public rooms + user's private rooms
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id
    }).populate('members', 'username avatar status lastSeen')
      .populate('pendingMembers', 'username avatar status')
      .sort({ updatedAt: -1 });
      
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rooms/create
// @desc    Create a room
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const { name, description, isPrivate, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const newRoom = new Room({
      name,
      description,
      isPrivate,
      avatar,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    const savedRoom = await newRoom.save();
    
    // Auto-join creator logic via socket can happen client-side or we emit directly
    // Populate before return
    const populatedRoom = await Room.findById(savedRoom._id)
      .populate('members', 'username avatar status')
      .populate('pendingMembers', 'username avatar status');

    res.status(201).json(populatedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rooms/:id/join
// @desc    Request to join a room
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // If already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // If already requested
    if (room.pendingMembers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    room.pendingMembers.push(req.user._id);
    await room.save();

    // Notify creator via socket
    const io = req.app.get('io');
    if (io) {
      io.emit(`notification_${room.createdBy}`, {
        type: 'JOIN_REQUEST',
        roomName: room.name,
        roomId: room._id,
        username: req.user.username
      });
    }

    res.json({ message: 'Join request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rooms/:id/approve
// @desc    Approve join request
// @access  Private (Room Admin)
router.post('/:id/approve', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Check if requester is creator
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can approve requests' });
    }

    // Move from pending to members
    room.pendingMembers = room.pendingMembers.filter(id => id.toString() !== userId);
    if (!room.members.includes(userId)) {
      room.members.push(userId);
    }
    
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('members', 'username avatar status')
      .populate('pendingMembers', 'username avatar status');

    // Notify users
    const io = req.app.get('io');
    if (io) {
      // Notify the room that a new member joined
      io.to(room._id.toString()).emit('room_updated', populatedRoom);
      // Specifically notify the approved user
      io.emit(`notification_${userId}`, {
        type: 'REQUEST_APPROVED',
        room: populatedRoom
      });
    }

    res.json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rooms/:id/reject
// @desc    Reject join request
// @access  Private (Room Admin)
router.post('/:id/reject', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can reject requests' });
    }

    room.pendingMembers = room.pendingMembers.filter(id => id.toString() !== userId);
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('members', 'username avatar status')
      .populate('pendingMembers', 'username avatar status');

    res.json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/discover', protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      members: { $ne: req.user._id },
      isPrivate: false
    }).populate('createdBy', 'username').lean();
    
    // Mark rooms that the user has already requested
    const roomsWithStatus = rooms.map(room => ({
      ...room,
      requested: room.pendingMembers && room.pendingMembers.some(id => id.toString() === req.user._id.toString())
    }));
    
    res.json(roomsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete a room
// @access  Private (Creator only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete room' });
    }

    await Room.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ roomId: req.params.id });

    // Notify all members via socket
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('room_deleted', req.params.id);
    }

    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rooms/:id/leave
// @desc    Leave a room
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave room. Delete it instead.' });
    }

    room.members = room.members.filter(id => id.toString() !== req.user._id.toString());
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('members', 'username avatar status')
      .populate('pendingMembers', 'username avatar status');

    // Notify room
    const io = req.app.get('io');
    if (io) {
      io.to(room._id.toString()).emit('room_updated', populatedRoom);
    }

    res.json({ message: 'Left room' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room details
// @access  Private (Creator only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, avatar, isPrivate } = req.body;
    let room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    room.name = name || room.name;
    room.description = description !== undefined ? description : room.description;
    room.avatar = avatar || room.avatar;
    room.isPrivate = isPrivate !== undefined ? isPrivate : room.isPrivate;

    await room.save();
    
    const populatedRoom = await Room.findById(room._id)
      .populate('members', 'username avatar status')
      .populate('pendingMembers', 'username avatar status');

    // Notify room
    const io = req.app.get('io');
    if (io) {
      io.to(room._id.toString()).emit('room_updated', populatedRoom);
    }

    res.json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rooms/:id/mute
// @desc    Mute a room
router.post('/:id/mute', protect, async (req, res) => {
  try {
    const { hours } = req.body; // 0 for always
    const until = hours > 0 ? new Date(Date.now() + hours * 60 * 60 * 1000) : null;

    const user = await User.findById(req.user._id);
    
    // Remove if already exists
    user.mutedRooms = user.mutedRooms.filter(m => m.roomId.toString() !== req.params.id);
    
    user.mutedRooms.push({ roomId: req.params.id, until });
    await user.save();

    res.json(user.mutedRooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rooms/:id/unmute
router.post('/:id/unmute', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.mutedRooms = user.mutedRooms.filter(m => m.roomId.toString() !== req.params.id);
    await user.save();
    res.json(user.mutedRooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rooms/:id/messages
// @desc    Get last 50 messages
// @access  Private
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId: req.params.id })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse()); // Send chronologically
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
