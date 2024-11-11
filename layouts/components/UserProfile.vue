<script setup>
import avatar1 from '@/images/avatars/avatar-1.png';
import { clearAuthToken, clearSelectedRoleToken, getSelectedRoleToken } from '@/middleware/auth';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import { VSkeletonLoader } from 'vuetify/components';


const router = useRouter();
const userRole = ref(''); // Store the decoded role name here
const isLoading = ref(false);  // Flag to control loading state

// Decode the role from `selectedRoleToken`
onMounted(() => {
  const selectedRoleToken = getSelectedRoleToken();
  if (selectedRoleToken) {
    try {
      // Decode and parse the token payload
      const payload = JSON.parse(atob(selectedRoleToken.split('.')[1]));
      userRole.value = payload?.selectedRole?.name || 'Unknown Role';
    } catch (error) {
      console.error('Error decoding selectedRoleToken:', error);
      userRole.value = 'Unknown Role';
    }
  } else {
    userRole.value = 'Unknown Role'; // Default value if no token is found
  }
});

// Add the "Role" navigation item to `userProfileList`
const userProfileList = [
  { type: 'navItem', title: 'Select Role', icon: 'ri-shield-user-line', value: '/role' },
  { type: 'divider' },
  // Additional menu items can be added here if needed
];

// Navigate to the route specified in each menu item with 3 seconds delay
async function navigateTo(path) {
  if (path === '/role') {
    // Start loading state
    isLoading.value = true;

    // First, navigate to /arsip/list_arsip
    await router.push('/arsip/list_arsip');

    // Simulate 3-second delay before navigating to /role
    setTimeout(() => {
      isLoading.value = false;  // Stop loading state
      router.push('/role');  // After 3 seconds, navigate to /role
    }, 100);
  } else {
    // For other paths, navigate directly
    router.push(path);
  }
}

// Handle logout
function logout() {
  clearAuthToken();
  clearSelectedRoleToken();
  router.push('/login');
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
            <h6 class="text-sm font-weight-medium">
              Users
            </h6>
            <VListItemSubtitle class="text-capitalize">
              {{ userRole || 'Not available' }}
            </VListItemSubtitle>
          </VListItem>

          <VDivider class="my-1" />

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

                <VListItemTitle class="text-sm font-weight-medium">
                  {{ item.title }}
                </VListItemTitle>
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

  <!-- Optional: Display a loading overlay while waiting -->
  <div v-if="isLoading" class="loading-overlay">
    <VSkeletonLoader size="64" color="primary" />
    <span>Loading...</span>
  </div>
</template>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 80%);
  block-size: 100%;
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
}
</style>
