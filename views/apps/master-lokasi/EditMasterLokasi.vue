<script setup>
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
})

const emit = defineEmits(['update:isDrawerOpen', 'update-location'])

const refForm = ref()
const formData = ref({})

// Initialize formData once props.location is available
onMounted(() => {
  if (props.location) {
    formData.value = { ...props.location }
  }
})

// Watch for changes in props.location and update formData
watch(
  () => props.location,
  (newLocation) => {
    formData.value = { ...newLocation }
  },
  { immediate: true } // Run immediately to capture initial value
)

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const onSubmit = () => {
  emit('update-location', formData.value) // Emit updated data
  closeDrawer()
}
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
        <!-- <VBtn @click="closeDrawer" class="close-btn" elevation="0">
          <VIcon>ri-close-line</VIcon>
        </VBtn> -->
      </VCardTitle>
      <VDivider />

      <!-- Form Section -->
      <VCardText>
        <VForm ref="refForm" @submit.prevent="onSubmit">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="formData.name"
                label="Name"
                placeholder="Enter location name"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.description"
                label="Description"
                placeholder="Enter description"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.building_name"
                label="Building Name"
                placeholder="Enter building name"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.room_name"
                label="Room Name"
                placeholder="Enter room name"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.rack_name"
                label="Rack Name"
                placeholder="Enter rack name"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.box_name"
                label="Box Name"
                placeholder="Enter box name"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.unit_id"
                label="Unit ID"
                placeholder="Enter unit ID"
                type="number"
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
