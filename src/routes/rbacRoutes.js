const express = require('express');
const router = express.Router();
const {
  getUserRoleController,
  assignRoleController,
  checkPermissionController
} = require('../controllers/rbacController');

const verifyJWT = require('../middlewares/verifyJWT');
const Role = require('../models/Role'); // ← Asegúrate de importar tu modelo Role

router.get('/user/:id/roles', verifyJWT, getUserRoleController);
router.post('/assign-role', verifyJWT, assignRoleController);
router.get('/check', verifyJWT, checkPermissionController);

// 🔄 Obtener roles dinámicos desde MongoDB
router.get('/roles', verifyJWT, async (req, res) => {
  try {
    const roles = await Role.find(); // ← Esto trae los roles reales desde la base de datos
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener roles' });
  }
});

module.exports = router;
