const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ej: "admin", "editor", "cliente"
  },
  permissions: [{
    type: String // Ej: "rbac:assign", "user:edit", etc.
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
