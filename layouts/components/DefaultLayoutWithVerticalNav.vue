<script setup>
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import { getSelectedRoleToken } from '@/middleware/auth'
import filterMenuByPermissions from '@/utils/filterMenuByPermissions'
import { VerticalNavLayout } from '@layouts'
import { jwtDecode } from 'jwt-decode'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

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
      { title: 'Units Has Roles', to: { name: 'management-unit_role_manage' }, icon: { icon: 'ri-circle-line' } },
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
]

// Ambil permissions secara reaktif dari composable
const userPermissions = ref([])

// Buat reactive ref untuk menu yang terfilter
const navItems = ref([])

// watchEffect untuk memperbarui menu setiap kali permissions berubah
watchEffect(() => {
  const selectedRoleToken = getSelectedRoleToken()
  if (selectedRoleToken) {
    try {
      const decodedRole = jwtDecode(selectedRoleToken)
      const permissions = decodedRole.permissions || []

      userPermissions.value = permissions // Update the permissions correctly

      navItems.value = filterMenuByPermissions(menuItems, permissions) // Filter the menu based on permissions
    } catch (error) {
      console.error('Error decoding the selectedRoleToken:', error)
    }
  }
})

// Computed property to determine if the current route matches the "Daftar Arsip" route
const route = useRoute()

const isArsipActive = computed(() => {
  return route.name === 'arsip-list_arsip' || route.name === 'arsip-add' || route.path.startsWith('/arsip/')
})
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn id="vertical-nav-toggle-btn" class="ms-n2 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
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
