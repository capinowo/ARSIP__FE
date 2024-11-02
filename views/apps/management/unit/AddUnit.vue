<script setup>
import { defineEmits, defineProps, nextTick, ref } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDrawerOpen', 'createUnit'])

const refForm = ref()
const codename = ref('')
const name = ref('')
const description = ref('')

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
      emit('createUnit', {
        codename: codename.value,
        name: name.value,
        description: description.value,
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
      title="Add New Unit"
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
              <!-- Codename Field -->
              <VCol cols="12">
                <VTextField
                  v-model="codename"
                  label="Codename"
                  placeholder="Enter codename"
                  :rules="[v => !!v || 'Codename is required']"
                  required
                />
              </VCol>

              <!-- Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="name"
                  label="Name"
                  placeholder="Enter name"
                  :rules="[v => !!v || 'Name is required']"
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
