const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  mutedRooms: [{
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    until: {
      type: Date // null for always
    }
  }]
}, { timestamps: true });

// Auto-generate avatar color using initials
userSchema.pre('save', function(next) {
  if (!this.avatar) {
    const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea', '#ed64a6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = this.username.substring(0, 2).toUpperCase();
    
    // Create a basic data URI SVG layout with the initials
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="${randomColor}" rx="50" ry="50"/>
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>`;
    
    this.avatar = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
