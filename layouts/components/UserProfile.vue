<script setup>
import avatar1 from '@images/avatars/avatar-1.png';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const router = useRouter()
const userRole = ref('') // Store the decoded role name here

// Decode the role from `selectedRoleToken`
onMounted(() => {
  const selectedRoleToken = localStorage.getItem('selectedRoleToken')
  if (selectedRoleToken) {
    try {
      const payload = JSON.parse(atob(selectedRoleToken.split('.')[1]))
      userRole.value = payload?.selectedRole?.name || 'Unknown Role'
    } catch (error) {
      console.error('Error decoding selectedRoleToken:', error)
      userRole.value = 'Unknown Role'
    }
  }
})

// Add the "Role" navigation item to `userProfileList`
const userProfileList = [
  { type: 'navItem', title: 'Select Role', icon: 'ri-shield-user-line', value: '/role' },
  { type: 'divider' },
  // Additional menu items can be added here if needed
]

// Navigate to the route specified in each menu item
function navigateTo(path) {
  router.push(path)
}

function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('tokenExpiration')
  localStorage.removeItem('selectedRoleToken')
  router.push('/login')
}
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>
            <h8 class="text-sm font-weight-medium">
              Users
            </h8>
            <VListItemSubtitle class="text-capitalize">
              {{ userRole || 'Not available' }}
            </VListItemSubtitle>
          </VListItem>

          <VDivider
                class="my-1"
              />

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                @click="navigateTo(item.value)"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="24"
                  />
                </template>

                <VListItemTitle class="text-sm font-weight-medium" >{{ item.title }}</VListItemTitle>
              </VListItem>

              <VDivider
                v-else
                class="my-1"
              />
            </template>

            <!-- Logout Button -->
            <VListItem>
              <VBtn
                block
                color="error"
                append-icon="ri-logout-box-r-line"
                @click="logout"
              >
                Logout
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
