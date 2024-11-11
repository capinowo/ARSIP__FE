<script setup>
import Footer from '@/layouts/components/Footer.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import UserProfile from '@/layouts/components/UserProfile.vue';
import { getSelectedRoleToken } from '@/middleware/auth'; // Adjust the path based on where auth.js is located
import filterMenuByPermissions from '@/utils/filterMenuByPermissions';
import { VerticalNavLayout } from '@layouts';
import { jwtDecode } from 'jwt-decode';
import { ref, watchEffect } from 'vue';


// Data menu statis
const menuItems = [
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
      // { title: 'Daftar Arsip Inactive', to: { name: 'arsip-arsip_inactive' }, icon: { icon: 'ri-circle-line' } }, //ketika selesai masa inactive
      // { title: 'Arsip Usul Musnah', to: { name: 'arsip-arsip_usul_musnah' }, icon: { icon: 'ri-circle-line' } }, //ketika selesai masa inactive
      // { title: 'Arsip Musnah', to: { name: 'arsip-arsip_musnah' }, icon: { icon: 'ri-circle-line' } }, //daftar arsip yang sudah dimusnahkan
    ],
  },
];

// Ambil permissions secara reaktif dari composable
const userPermissions = ref([]);

// Buat reactive ref untuk menu yang terfilter
const navItems = ref([]);

// watchEffect untuk memperbarui menu setiap kali permissions berubah
watchEffect(() => {
  const selectedRoleToken = getSelectedRoleToken();
  if (selectedRoleToken) {
    try {
      const decodedRole = jwtDecode(selectedRoleToken);
      const permissions = decodedRole.permissions || [];
      userPermissions.value = permissions; // Update the permissions correctly

      navItems.value = filterMenuByPermissions(menuItems, permissions); // Filter the menu based on permissions
    } catch (error) {
      console.error('Error decoding the selectedRoleToken:', error);
    }
  }
});

</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n2 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>
