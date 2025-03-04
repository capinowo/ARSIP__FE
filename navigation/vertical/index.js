import { useState } from 'nuxt/app'
import { computed } from 'vue'

const permissionAccess = {
  'lokasi-dashboard': ['/', 'index', 'master-master_lokasi'],
  'dashboard-arsip': ['/', 'index', 'arsip-list_arsip'],
  'lokasi-dashboard-arsip': ['/', 'index', 'arsip-list_arsip', 'master-master_lokasi'],
  'access-control': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'management-log_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip', 'arsip-view_arsip', 'management-unit_role_manage'],
  'arsip-detail': ['arsip-list_arsip'],
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
      { title: 'Tambah Arsip', to: { name: 'arsip-add' }, icon: { icon: 'ri-circle-line' } },
    ],
  },
], userPermissions.value))
