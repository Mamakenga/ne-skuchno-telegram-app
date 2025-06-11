const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telegram_id: {
    type: String,
    required: true,
    unique: true
  },
  username: String,
  first_name: String,
  last_name: String,
  is_premium: {
    type: Boolean,
    default: false
  },
  favorite_activities: [String], // ID активностей
  completed_activities: [{
    activity_id: String,
    completed_at: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 }
  }],
  daily_generations: {
    count: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  },
  preferences: {
    default_age_group: String,
    favorite_categories: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);