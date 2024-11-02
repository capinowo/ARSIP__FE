<script setup>
import { defineEmits, defineProps, nextTick, ref } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDrawerOpen', 'create-location'])

const refForm = ref()
const unit_id = ref(1) // Example unit ID
const name = ref('')
const description = ref('')
const building_name = ref('')
const room_name = ref('')
const rack_name = ref('')
const box_name = ref('')

// Close drawer function
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

// Form submission handler
const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('create-location', {
        unit_id: unit_id.value,
        name: name.value,
        description: description.value,
        building_name: building_name.value,
        room_name: room_name.value,
        rack_name: rack_name.value,
        box_name: box_name.value,
      })
      closeNavigationDrawer()
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- Drawer Header -->
    <AppDrawerHeaderSection
      title="Add New Location"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <!-- Scrollable Content -->
    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- Form Section -->
          <VForm
            ref="refForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- Unit ID Field -->
              <VCol cols="12">
                <VTextField
                  v-model="unit_id"
                  label="Unit ID"
                  placeholder="Enter unit ID"
                  type="number"
                  required
                />
              </VCol>

              <!-- Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="name"
                  label="Location Name"
                  placeholder="Enter location name"
                  :rules="[v => !!v || 'Location name is required']"
                  required
                />
              </VCol>

              <!-- Description Field -->
              <VCol cols="12">
                <VTextField
                  v-model="description"
                  label="Description"
                  placeholder="Enter description"
                />
              </VCol>

              <!-- Building Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="building_name"
                  label="Building Name"
                  placeholder="Enter building name"
                />
              </VCol>

              <!-- Room Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="room_name"
                  label="Room Name"
                  placeholder="Enter room name"
                />
              </VCol>

              <!-- Rack Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="rack_name"
                  label="Rack Name"
                  placeholder="Enter rack name"
                />
              </VCol>

              <!-- Box Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="box_name"
                  label="Box Name"
                  placeholder="Enter box name"
                />
              </VCol>

              <!-- Submit and Cancel Buttons -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-4"
                >
                  Submit
                </VBtn>
                <VBtn
                  type="reset"
                  variant="outlined"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
