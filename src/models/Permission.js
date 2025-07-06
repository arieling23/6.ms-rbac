const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true // Ej: "rbac:assign", "user:update"
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Permission', permissionSchema);
