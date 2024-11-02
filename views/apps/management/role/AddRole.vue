<script setup>
import { defineEmits, defineProps, nextTick, ref } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'


const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDrawerOpen', 'createRole'])

const refForm = ref()
const name = ref('')
const description = ref('')
const permissionIds = ref(1) // Example permission ID

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
      emit('createRole', {
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
      title="Add New Role"
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
              <!-- Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="name"
                  label="Role Name"
                  placeholder="Enter role name"
                  :rules="[v => !!v || 'Role name is required']"
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

              <!-- Permissions Field (Example) -->
              <!--
                <VCol cols="12">
                <VTextField
                v-model="permissionIds"
                label="Permission ID"
                placeholder="Enter permission ID"
                type="number"
                />
                </VCol> 
              -->

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
