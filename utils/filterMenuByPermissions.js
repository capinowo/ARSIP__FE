// filterMenuByPermissions.js

// Define permissionAccess map untuk menentukan route yang diizinkan untuk setiap permission
const permissionAccess = {
  'lokasi-dashboard': ['/', 'index', 'master-master_lokasi'],
  'dashboard-arsip': ['/', 'index', 'arsip-list_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah'],
  'lokasi-dashboard-arsip': ['/', 'index', 'arsip-list_arsip', 'master-master_lokasi'],
  'access-control': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'management-log_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah'],
  'system': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'management-log_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah'],
  'admin': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'management-log_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah'],
  'pimpinan': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-berita_acara_pemusnahan'],
  'pimpinan_uk_1': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_pemusnahan'],
  'operator_uk_1': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'arsip-add'],
  'verifikator_uk_1': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah'],
  'pimpinan_uk_2': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-add'],
  'operator_uk_2': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'arsip-add'],
  'verifikator_uk_2': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-arsip_usul_musnah'],
  'upp': ['/', 'index', 'arsip-list_arsip', 'arsip-arsip_inactive', 'arsip-add'],


  // 'arsip-[id]-detail': ['arsip-list_arsip'],
  // 'arsip-add': ['arsip-list_arsip'],
}

// Fungsi untuk memfilter menu berdasarkan permissions user
export default function filterMenuByPermissions(menu, permissions) {
  // Buat set yang berisi semua route yang diizinkan berdasarkan permissions
  const allowedRoutes = new Set()

  permissions.forEach(permission => {
    const routes = permissionAccess[permission]
    if (routes) {
      routes.forEach(route => allowedRoutes.add(route))
    }
  })

  // Filter menu berdasarkan allowedRoutes
  return menu
    .map(item => {
      // Jika item memiliki children, filter children berdasarkan allowedRoutes
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          return allowedRoutes.has(child.to.name) || Array.from(allowedRoutes).some(route => route.startsWith(child.to.name))
        })

        // Kembalikan item jika memiliki children yang diizinkan
        if (filteredChildren.length) {
          return { ...item, children: filteredChildren }
        }

        return null // Jika tidak ada children yang diizinkan, hapus item ini
      }

      // Kembalikan item jika item diizinkan sebagai top-level item
      return allowedRoutes.has(item.to.name) ? item : null
    })
    .filter(Boolean) // Hapus item null dari hasil akhir
}
