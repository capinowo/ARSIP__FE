// middleware/authMiddleware.js
import { clearSelectedRoleToken, getSelectedRoleToken } from '@/middleware/auth';
import { jwtDecode } from 'jwt-decode';
import { navigateTo, useState } from 'nuxt/app';

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.env.SSR) {
    // Bypass middleware for /role page
    // if (to.path === '/role') {
    //   return;
    // }

    const selectedRoleToken = getSelectedRoleToken();

    if (!selectedRoleToken) {
      clearSelectedRoleToken();
      return navigateTo('/login');
    }

    try {
      // Decode the token
      const decodedRole = jwtDecode(selectedRoleToken);
      // console.log("Decoded Role:", decodedRole); // Debugging to see decoded data

      const currentTime = Date.now() / 1000;

      // Check if the token is expired
      if (decodedRole.exp < currentTime) {
        console.log("Token expired.");
        clearSelectedRoleToken();
        return navigateTo('/login');
      }

      useState('selectedRole', () => decodedRole);

      // Define access by permission names for specific pages
      const permissionAccess = {
        'lokasi-dashboard': ['/', 'index', 'master-master_lokasi'],
        'dashboard-arsip': ['/', 'index', 'arsip-list_arsip'],
        'lokasi-dashboard-arsip': ['/', 'index', 'arsip-list_arsip', 'master-master_lokasi'],
        'access-control': ['/', 'index', 'management-perm_manage', 'management-role_manage', 'management-user_manage', 'management-unit_manage', 'master-master_jra', 'master-master_lokasi', 'arsip-list_arsip']
      };

      // Get user's permissions from the token
      const userPermissions = decodedRole.permissions || [];
      const allowedPages = new Set();

      // Collect all allowed pages based on permissions
      userPermissions.forEach(permission => {
        const pages = permissionAccess[permission];
        if (pages) {
          pages.forEach(page => allowedPages.add(page));
        }
      });

      // Debugging output for permissions and access check
      // console.log("User Permissions:", userPermissions);
      // console.log("Allowed Pages:", Array.from(allowedPages));
      // console.log("Attempting to access:", to.name || to.path);

      // Check if the requested page is in allowed pages
      const requestedPage = to.name || to.path; // Check both name and path
      if (!allowedPages.has(requestedPage)) {
        console.log("Access denied to this page.");
        return navigateTo('/unauthorized');
      }

    } catch (error) {
      // console.error("Error decoding token:", error); // Log specific decoding error
      clearSelectedRoleToken();
      return navigateTo('/error');
    }
  }
});
