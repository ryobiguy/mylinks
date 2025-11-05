const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['view', 'click'],
    required: true
  },
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // null for page views, linkId for link clicks
  },
  linkTitle: {
    type: String,
    default: null
  },
  // Visitor information
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String,
    default: 'unknown'
  },
  os: {
    type: String,
    default: 'unknown'
  },
  // Location data
  country: {
    type: String,
    default: 'unknown'
  },
  city: {
    type: String,
    default: 'unknown'
  },
  // Referrer
  referrer: {
    type: String,
    default: 'direct'
  },
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for faster queries
analyticsSchema.index({ page: 1, timestamp: -1 });
analyticsSchema.index({ page: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
