<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  location: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['update:isDrawerOpen', 'update-location']);

const refForm = ref();
const formData = ref({});
const units = ref([]); // Array to store units from API

// Initialize formData once props.location is available
onMounted(() => {
  if (props.location) {
    formData.value = { ...props.location };
  }
  fetchUnits(); // Fetch units when component is mounted
});

// Watch for changes in props.location and update formData
watch(
  () => props.location,
  (newLocation) => {
    formData.value = { ...newLocation };
  },
  { immediate: true }
);

// Fetch list of units from API
const fetchUnits = async () => {
  const query = `
    query GetUnits {
      getUnits {
        data {
          id
          name
          description
        }
      }
    }
  `;

  try {
    const token = getSelectedRoleToken();
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.data && result.data.getUnits && result.data.getUnits.data) {
      units.value = result.data.getUnits.data.map(unit => ({
        title: unit.name,
        value: unit.id,
      }));
    } else if (result.errors) {
      console.error('GraphQL errors:', result.errors);
    } else {
      console.error('Unexpected response structure:', result);
    }
  } catch (error) {
    console.error('Error fetching units:', error);
  }
};

// Close drawer function
const closeDrawer = () => {
  emit('update:isDrawerOpen', false);
};

// Form submission handler
const onSubmit = () => {
  emit('update-location', formData.value); // Emit updated data
  closeDrawer();
};
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="closeDrawer"
  >
    <!-- Drawer Header Section -->
    <VCard flat>
      <VCardTitle class="d-flex justify-space-between">
        <span>Edit Location</span>
      </VCardTitle>
      <VDivider />

      <!-- Form Section -->
      <VCardText>
        <VForm ref="refForm" @submit.prevent="onSubmit">
          <VRow>
            <!-- Location Name Field -->
            <VCol cols="12">
              <VTextField
                v-model="formData.name"
                label="Name"
                placeholder="Enter location name"
                required
              />
            </VCol>

            <!-- Description Field -->
            <VCol cols="12">
              <VTextField
                v-model="formData.description"
                label="Description"
                placeholder="Enter description"
              />
            </VCol>

            <!-- Building Name Field -->
            <VCol cols="12">
              <VTextField
                v-model="formData.building_name"
                label="Building Name"
                placeholder="Enter building name"
              />
            </VCol>

            <!-- Room Name Field -->
            <VCol cols="12">
              <VTextField
                v-model="formData.room_name"
                label="Room Name"
                placeholder="Enter room name"
              />
            </VCol>

            <!-- Rack Name Field -->
            <VCol cols="12">
              <VTextField
                v-model="formData.rack_name"
                label="Rack Name"
                placeholder="Enter rack name"
              />
            </VCol>

            <!-- Box Name Field -->
            <VCol cols="12">
              <VTextField
                v-model="formData.box_name"
                label="Box Name"
                placeholder="Enter box name"
              />
            </VCol>

            <!-- Unit ID Field as Select Dropdown -->
            <VCol cols="12">
              <VSelect
                v-model="formData.unit_id"
                :items="units"
                label="Unit"
                placeholder="Select a unit"
                :rules="[v => !!v || 'Unit is required']"
                required
              />
            </VCol>

            <!-- Submit and Cancel Buttons -->
            <VCol cols="12" class="d-flex justify-end">
              <VBtn type="submit" class="me-4">
                Save Changes
              </VBtn>
              <VBtn variant="outlined" color="error" @click="closeDrawer">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>

<style scoped>
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  block-size: 24px;
  inline-size: 24px;
  min-inline-size: 24px;
}
</style>
