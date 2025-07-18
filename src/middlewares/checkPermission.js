const { userHasPermission } = require('../services/rbacService');


const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    try {
      const allowed = await userHasPermission(userId, requiredPermission);
      if (!allowed) {
        return res.status(403).json({ message: 'Permiso denegado' });
      }
      next();
    } catch (err) {
      console.error('Error en checkPermission:', err);
      res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};

module.exports = checkPermission;
