import { useState } from 'nuxt/app'
import { computed } from 'vue'

const permissionAccess = {
  'lokasi-dashboard': ['/', 'index', 'master-master_lokasi'],
  'dashboard-arsip': ['/', 'index', 'arsip-list_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah'],
  'lokasi-dashboard-arsip': ['/', 'index', 'arsip-list_arsip', 'master-master_lokasi'],
  'access-control': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'management-log_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah', 'verifikasi-berita_acara_pemusnahan', 'verifikasi-unggah_berita_acara_pemusnahan'],
  'system': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'management-log_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah', 'verifikasi-berita_acara_pemusnahan', 'verifikasi-unggah_berita_acara_pemusnahan'],
  'admin': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'management-log_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah', 'verifikasi-berita_acara_pemusnahan', 'verifikasi-unggah_berita_acara_pemusnahan'],
  'pimpinan': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-berita_acara_pemusnahan'],
  'pimpinan_uk_1': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_pemusnahan'],
  'operator_uk_1': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'arsip-add'],
  'verifikator_uk_1': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-persetujuan_arsip', 'verifikasi-persetujuan_usul_musnah'],
  'pimpinan_uk_2': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-add'],
  'operator_uk_2': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'arsip-add'],
  'verifikator_uk_2': ['/', 'index', 'arsip-list_arsip', 'arsip-view_arsip', 'arsip-arsip_inactive', 'verifikasi-arsip_usul_musnah', 'arsip-arsip_musnah', 'arsip-add', 'verifikasi-arsip_usul_musnah'],
  'upp': ['/', 'index', 'arsip-list_arsip', 'arsip-arsip_inactive', 'arsip-add'],
}

// Ambil permissions pengguna dari state secara reaktif
const userPermissions = computed(() => useState('selectedRole').value?.permissions || [])

function filterMenuByPermissions(menu, permissions) {
  const allowedRoutes = new Set()

  permissions.forEach(permission => {
    const routes = permissionAccess[permission]
    if (routes) {
      routes.forEach(route => allowedRoutes.add(route))
    }
  })

  return menu
    .map(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          return allowedRoutes.has(child.to.name) || Array.from(allowedRoutes).some(route => route.startsWith(child.to.name))
        })

        if (filteredChildren.length) {
          return { ...item, children: filteredChildren }
        }

        return null
      }

      return allowedRoutes.has(item.to.name) ? item : null
    })
    .filter(Boolean)
}

export default computed(() => filterMenuByPermissions([
  {
    title: 'Dashboard',
    to: { name: 'index' },
    icon: { icon: 'ri-home-smile-line' },
  },
  {
    title: 'Management',
    icon: { icon: 'ri-computer-line' },
    children: [
      { title: 'Users', to: { name: 'management-user_manage' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Roles', to: { name: 'management-role_manage' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Units', to: { name: 'management-unit_manage' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Permissions', to: { name: 'management-perm_manage' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Log', to: { name: 'management-log_manage' }, icon: { icon: 'ri-circle-line' } },
    ],
  },
  {
    title: 'Master',
    icon: { icon: 'ri-bank-line' },
    children: [
      { title: 'Master Lokasi', to: { name: 'master-master_lokasi' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Master Klasifikasi', to: { name: 'master-master_jra' }, icon: { icon: 'ri-circle-line' } },
    ],
  },
  {
    title: 'Arsip',
    icon: { icon: 'ri-book-shelf-line' },
    children: [
      { title: 'Daftar Arsip', to: { name: 'arsip-list_arsip' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Status Usulan', to: { name: 'arsip-view_arsip' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Unggah Arsip', to: { name: 'arsip-add' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Usulan Masuk', to: { name: 'verifikasi-persetujuan_arsip' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Usulan Pemusnahan', to: { name: 'verifikasi-arsip_usul_musnah' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Persetujuan Pemusnahan', to: { name: 'verifikasi-persetujuan_usul_musnah' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Pemusnahan Arsip', to: { name: 'verifikasi-persetujuan_pemusnahan' }, icon: { icon: 'ri-circle-line' } },
      { title: 'Berita Acara', to: { name: 'verifikasi-berita_acara_pemusnahan' }, icon: { icon: 'ri-circle-line' } },
    ],
  },
], userPermissions.value))
