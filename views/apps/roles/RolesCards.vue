<script setup>
import avatar1 from '@/images/avatars/avatar-1.png'
import avatar2 from '@/images/avatars/avatar-2.png'
import avatar3 from '@/images/avatars/avatar-3.png'
import avatar4 from '@/images/avatars/avatar-4.png'
import avatar5 from '@/images/avatars/avatar-5.png'
import { editPermission } from '@/utils/permission' // Import editPermission function from permission.js
import { useState } from 'nuxt/app'
import { computed, ref } from 'vue'

// Array of avatars
const avatarImages = [avatar1, avatar2, avatar3, avatar4, avatar5]

// Helper function to get a random avatar
const getRandomAvatar = () => avatarImages[Math.floor(Math.random() * avatarImages.length)]

// Role mapping: map each role value to a display label
const roleMapping = {
  system: 'ADMIN PUSAT',
  admin: 'ADMIN',
  pimpinan_uk_1: 'PIMPINAN UNIT KERJA 1',
  pimpinan: 'PIMPINAN',
  operator_uk_1: 'OPERATOR UNIT KERJA 1',
  operator: 'OPERATOR',
  verifikator: 'VERIFIKATOR',
}

// Fetch user data from global state
const userState = useState('user')

// Roles List with display name and random avatars
const roles = computed(() =>
  userState.value.roles.map(role => ({
    role: roleMapping[role] || role, // Display name, fallback to original if not in mapping
    value: role,                      // Original role value
    users: [getRandomAvatar()],       // Assign a random avatar
    details: {
      name: roleMapping[role] || role,
      permissions: userState.value.permissions.map(permission => ({
        name: permission,
        read: true,
        write: true,
        create: true,
      })),
    },
  })),
)

const isRoleDialogVisible = ref(false)
const roleDetail = ref()
const isAddRoleDialogVisible = ref(false)

// Update the role selection to call the API, store token, and navigate
const selectRole = async roleDetails => {
  await editPermission(roleDetails) // Call the imported function from permission.js
  isRoleDialogVisible.value = true
  roleDetail.value = roleDetails
}
</script>

<template>
  <VRow
    class="pt-6 px-4 mx-auto"
    style="max-inline-size: 1200px;"
  >
    <!-- 👉 Roles -->
    <VCol
      v-for="item in roles"
      :key="item.value"
      cols="12"
      sm="6"
      lg="4"
      class="mb-4"
    >
      <VCard class="pa-4">
        <VCardText class="d-flex align-center">
          <VAvatar
            v-if="item.users.length > 0"
            size="40"
            :image="item.users[0]"
          />
          <VSpacer />
        </VCardText>

        <VCardText>
          <h5 class="text-h5 mb-2">
            {{ item.role }} <!-- Display name -->
          </h5>
          <div class="d-flex align-center">
            <VBtn
              color="primary"
              @click="selectRole(item.details)"
            >
              Select Role
            </VBtn>
            <VSpacer />
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Role dialog for editing permissions -->
  <AddEditRoleDialog
    v-model:is-dialog-visible="isRoleDialogVisible"
    v-model:role-permissions="roleDetail"
  />
</template>

<style scoped>
/* Additional spacing adjustments */
.VRow {
  margin-block-start: 1rem;
  max-inline-size: 1200px;
}

.VCol {
  padding-inline: 1rem;
}
</style>
