// filterMenuByPermissions.js

// Define permissionAccess map untuk menentukan route yang diizinkan untuk setiap permission
const permissionAccess = {
    'lokasi-dashboard': ['/', 'index', 'master-master_lokasi'],
    'dashboard-arsip': ['/', 'index', 'arsip-list_arsip',],
    'lokasi-dashboard-arsip': ['/', 'index', 'arsip-list_arsip','master-master_lokasi'],
    'access-control': [
      '/',
      'index',
      'management-perm_manage',
      'management-role_manage',
      'management-user_manage',
      'management-unit_manage',
      'master-master_jra',
      'master-master_lokasi',
      'arsip-list_arsip',
      'arsip-[id]-detail'
    ]
  };
  
  // Fungsi untuk memfilter menu berdasarkan permissions user
  export default function filterMenuByPermissions(menu, permissions) {
    // Buat set yang berisi semua route yang diizinkan berdasarkan permissions
    const allowedRoutes = new Set();
    permissions.forEach(permission => {
      const routes = permissionAccess[permission];
      if (routes) {
        routes.forEach(route => allowedRoutes.add(route));
      }
    });
  
    // Filter menu berdasarkan allowedRoutes
    return menu
      .map(item => {
        // Jika item memiliki children, filter children berdasarkan allowedRoutes
        if (item.children) {
          const filteredChildren = item.children.filter(child => allowedRoutes.has(child.to.name));
          // Kembalikan item jika memiliki children yang diizinkan
          if (filteredChildren.length) {
            return { ...item, children: filteredChildren };
          }
          return null; // Jika tidak ada children yang diizinkan, hapus item ini
        }
        // Kembalikan item jika item diizinkan sebagai top-level item
        return allowedRoutes.has(item.to.name) ? item : null;
      })
      .filter(Boolean); // Hapus item null dari hasil akhir
  }
  