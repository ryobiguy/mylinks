const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'link'
  },
  clicks: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const pageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  title: {
    type: String,
    default: 'My Links'
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'default',
    enum: ['default', 'dark', 'gradient', 'minimal', 'colorful']
  },
  customColors: {
    background: {
      type: String,
      default: '#ffffff'
    },
    text: {
      type: String,
      default: '#000000'
    },
    button: {
      type: String,
      default: '#000000'
    },
    buttonText: {
      type: String,
      default: '#ffffff'
    }
  },
  links: [linkSchema],
  socialLinks: {
    twitter: String,
    instagram: String,
    facebook: String,
    youtube: String,
    tiktok: String,
    linkedin: String
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  customDomain: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
pageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Page', pageSchema);
