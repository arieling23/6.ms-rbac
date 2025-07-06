const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserRole', userRoleSchema,);
