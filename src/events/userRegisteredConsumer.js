const UserRole = require('../models/UserRole');

const handleUserRegistered = async (msg) => {
  try {
    const event = JSON.parse(msg.content.toString());

    const { id: userId, role } = event.data;

    if (!userId || !role) {
      console.warn('⚠️ Evento user.registered con datos incompletos');
      return;
    }

    await UserRole.findOneAndUpdate(
      { userId },
      { role },
      { upsert: true, new: true }
    );

    console.log(`🟢 Rol '${role}' asignado al usuario ${userId} desde evento`);
  } catch (err) {
    console.error('🔴 Error procesando evento user.registered:', err.message);
  }
};

module.exports = handleUserRegistered;
