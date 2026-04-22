/**
 * Static permission list. Each permission has a unique numeric ID.
 * Format: module.type  (type is one of: index, create, edit, destroy)
 * The admin role (system_reserve='1') bypasses all checks.
 */

const MODULES = [
  'user', 'product', 'category', 'brand', 'attribute', 'tag',
  'order', 'review', 'coupon', 'shipping', 'tax', 'role',
  'blog', 'page', 'faq', 'currency', 'setting', 'theme_option',
  'banner', 'report',
];

const TYPES = ['index', 'create', 'edit', 'destroy'];

const PERMISSIONS = [];
let id = 1;
MODULES.forEach((module) => {
  TYPES.forEach((type) => {
    PERMISSIONS.push({ id: id++, name: `${module}.${type}` });
  });
});

/**
 * Returns the /module response structure expected by PermissionsCheckBoxForm.
 */
function getModuleList() {
  const map = {};
  PERMISSIONS.forEach(({ id, name }) => {
    const [module, type] = name.split('.');
    if (!map[module]) map[module] = [];
    map[module].push({ permission_id: id, name: type });
  });
  return Object.entries(map).map(([name, module_permissions]) => ({ name, module_permissions }));
}

/**
 * Resolves an array of permission IDs to full { id, name } objects.
 * Used by /self to populate user.permission.
 */
function resolvePermissions(ids = []) {
  return PERMISSIONS.filter((p) => ids.includes(p.id));
}

module.exports = { PERMISSIONS, getModuleList, resolvePermissions };
