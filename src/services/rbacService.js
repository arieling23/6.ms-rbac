const UserRole = require('../models/UserRole');
const Role = require('../models/Role');


const getUserRole = async (userId) => {
  const userRole = await UserRole.findOne({ userId });
  return userRole ? userRole.role : null;
};


const assignRoleToUser = async (userId, roleName) => {
  const role = await Role.findOne({ name: roleName.toLowerCase() });
  if (!role) throw new Error('Rol no existente');

  const userRole = await UserRole.findOneAndUpdate(
    { userId },
    { role: roleName },
    { upsert: true, new: true }
  );

  return userRole;
};


const userHasPermission = async (userId, permissionKey) => {
  const userRole = await UserRole.findOne({ userId });
  if (!userRole) return false;

  const role = await Role.findOne({ name: userRole.role });
  if (!role) return false;

  return role.permissions.includes(permissionKey);
};

module.exports = {
  getUserRole,
  assignRoleToUser,
  userHasPermission
};
