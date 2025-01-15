<!-- eslint-disable camelcase -->
<script setup>
import { setPermissionsFromToken } from '@/composables/usePermission' // Import fungsi dari composable
import avatar1 from '@/images/avatars/avatar-1.png'
import avatar2 from '@/images/avatars/avatar-2.png'
import avatar3 from '@/images/avatars/avatar-3.png'
import avatar4 from '@/images/avatars/avatar-4.png'
import avatar5 from '@/images/avatars/avatar-5.png'
import { getAuthToken, setSelectedRoleToken } from '@/middleware/auth'
import { navigateTo, useState } from 'nuxt/app'
import { computed, ref } from 'vue'

const avatarImages = [avatar1, avatar2, avatar3, avatar4, avatar5]
const getRandomAvatar = () => avatarImages[Math.floor(Math.random() * avatarImages.length)]

// Define role mapping
const roleMapping = {
  system: 'ADMIN PUSAT',
  admin: 'ADMIN',
  pimpinan_uk_1: 'PIMPINAN UNIT KERJA 1',
  pimpinan: 'PIMPINAN',
  operator_uk_1: 'OPERATOR UNIT KERJA 1',
  operator: 'OPERATOR',
  verifikator: 'VERIFIKATOR',
  admin_uk_1: 'ADMIN UNIT KERJA 1',
}

const userState = useState('user')

// Computed roles with name and value
const roles = computed(() =>
  userState.value?.roles?.map(role => ({
    name: roleMapping[role] || role,
    value: role,
    users: [getRandomAvatar()],
    details: {
      name: roleMapping[role] || role,
      value: role,
      permissions: userState.value?.permissions?.map(permission => ({
        name: permission,
        read: true,
        write: true,
        create: true,
      })),
    },
  })) || [],
)

const isRoleDialogVisible = ref(false)
const roleDetail = ref()

const selectRole = async roleDetails => {
  const authToken = getAuthToken()

  if (!authToken) {
    console.error('Auth token is missing. Redirecting to login.')
    navigateTo('/login')
    
    return
  }

  try {
    const query = `
      mutation Mutation($roleName: String!) {
        selectRole(roleName: $roleName)
      }
    `

    const variables = { roleName: roleDetails.value }

    // console.log('Role Name being sent to API:', variables.roleName);

    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const result = await response.json()

    // console.log('API response:', result);

    if (result.errors) {
      console.error('GraphQL error:', result.errors)
      throw new Error('Failed to retrieve role token due to GraphQL error')
    }

    const roleToken = result.data.selectRole

    if (!roleToken) {
      throw new Error('Role token not received')
    }

    // Store the role token in local storage for later use
    setSelectedRoleToken(roleToken)

    // console.log('Role token saved to local storage.');

    // Set permissions from the token in composable
    setPermissionsFromToken(roleToken)

    // console.log('Permissions set from role token.');

    // Redirect to the home page or dashboard
    navigateTo('/')

  } catch (error) {
    console.error('Error fetching role token:', error)
  }
}
</script>


<template>
  <VRow
    class="pt-6 px-4 mx-auto"
    style="max-inline-size: 1200px;"
  >
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
            {{ item.name }} <!-- Display name for role -->
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

  <!-- Role dialog for editing permissions if needed -->
  <AddEditRoleDialog
    v-model:is-dialog-visible="isRoleDialogVisible"
    v-model:role-permissions="roleDetail"
  />
</template>

<style scoped>
.VRow {
  margin-block-start: 1rem;
  max-inline-size: 1200px;
}

.VCol {
  padding-inline: 1rem;
}
</style>
