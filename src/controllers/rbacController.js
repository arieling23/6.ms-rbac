const {
  getUserRole,
  assignRoleToUser,
  userHasPermission
} = require('../services/rbacService');

const { publishEvent } = require('../events/publisher');

const getUserRoleController = async (req, res) => {
  try {
    const role = await getUserRole(req.params.id);
    res.status(200).json({ role });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener rol' });
  }
};

const assignRoleController = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ message: 'Datos incompletos' });

  try {
    const updated = await assignRoleToUser(userId, role);

    
    await publishEvent('user.role.updated', {
      userId,
      newRole: role
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error al asignar rol' });
  }
};

const checkPermissionController = async (req, res) => {
  const { permission } = req.query;
  const userId = req.user.userId;

  try {
    const hasPerm = await userHasPermission(userId, permission);
    res.status(200).json({ allowed: hasPerm });
  } catch (err) {
    res.status(500).json({ message: 'Error al verificar permisos' });
  }
};

module.exports = {
  getUserRoleController,
  assignRoleController,
  checkPermissionController
};
