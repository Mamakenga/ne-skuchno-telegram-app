const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },

  short_description: {
    type: String,
    required: true,
    maxlength: 200
  },
  full_description: {
    type: String,
    required: true,
    maxlength: 1000
  },

  category: {
    type: String,
    required: true
  },
  age_groups: [String],
  duration_minutes: Number,
  difficulty: String,
  materials: [String],
  instructions: [String],
  skills_developed: [String],
  season: String,
  location: String,
  premium: Boolean,
  tags: [String],
  rating: Number,
  times_completed: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', ActivitySchema);