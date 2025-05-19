// middleware/authMiddleware.js
import { clearSelectedUnitToken, getSelectedUnitToken } from '@/middleware/auth'
import { jwtDecode } from 'jwt-decode'
import { navigateTo, useState } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.env.SSR) {
    // Bypass middleware for /role page
    // if (to.path === '/role') {
    //   return;
    // }

    const selectedUnitToken = getSelectedUnitToken()

    if (!selectedUnitToken) {
      clearSelectedUnitToken()

      return navigateTo('/login')
    }

    try {
      // Decode the token
      const decodedUnit = jwtDecode(selectedUnitToken)

      // console.log("Decoded Role:", decodedRole); // Debugging to see decoded data

      const currentTime = Date.now() / 1000

      // Check if the token is expired
      if (decodedUnit.exp < currentTime) {
        console.log("Token expired.")
        clearSelectedUnitToken()

        return navigateTo('/login')
      }

      useState('selectedRole', () => decodedUnit)

      // Define access by permission names for specific pages
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

      // Get user's permissions from the token
      const userPermissions = decodedUnit.permissions || []
      const allowedPages = new Set()

      // Collect all allowed pages based on permissions
      userPermissions.forEach(permission => {
        const pages = permissionAccess[permission]
        if (pages) {
          pages.forEach(page => allowedPages.add(page))
        }
      })

      // Debugging output for permissions and access check
      // console.log("User Permissions:", userPermissions);
      // console.log("Allowed Pages:", Array.from(allowedPages));
      // console.log("Attempting to access:", to.name || to.path);

      // Check if the requested page is in allowed pages
      // const requestedPage = to.name || to.path;
      // if (!allowedPages.has(requestedPage)) {
      //   console.log("Access denied to this page.");
      //   return navigateTo('/unauthorized');
      // }

    } catch (error) {
      // console.error("Error decoding token:", error); // Log specific decoding error
      clearSelectedUnitToken()

      return navigateTo('/error')
    }
  }
})

