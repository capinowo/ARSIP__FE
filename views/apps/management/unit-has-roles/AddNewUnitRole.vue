<!-- eslint-disable vue/custom-event-name-casing -->
<!-- eslint-disable camelcase -->
<!-- eslint-disable camelcase -->

<script setup>
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from '@/utils/api'
import { nextTick, ref } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: Boolean,
  units: Array,
  roles: Array,
  users: Array,
})

const emit = defineEmits(['update:isDrawerOpen', 'create-unit-role', 'refresh-role-units'])

const isFormValid = ref(false)
const refForm = ref(null)

const formData = ref({
  role_id: '',
  unit_id: '',
  user_id: '',
})

const requiredValidator = value => {
  return !!value || 'This field is required'
}

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = async () => {
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      const mutation = `
        mutation Mutation($data: RoleUnitCreateInput!) {
          createRoleUnit(data: $data) {
            id
            role_id
            unit_id
            user_id
          }
        }
      `

      const variables = {
        data: formData.value,
      }

      try {
        const token = getSelectedRoleToken()

        const response = await fetch(BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ query: mutation, variables }),
        })

        const result = await response.json()

        emit('create-unit-role', result.data.createRoleUnit)
        emit('refresh-role-units') // Emit event to refresh role units
        closeNavigationDrawer()
      } catch (error) {
        console.error('Error creating unit role:', error)
      }
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>


<template>
  <VNavigationDrawer
    :model-value="props.isDrawerOpen"
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- Drawer Title -->
    <AppDrawerHeaderSection
      title="Add New Unit Role"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- Unit ID -->
              <VCol cols="12">
                <VSelect
                  v-model="formData.unit_id"
                  :items="props.units.map(unit => ({ title: unit.name, value: unit.id }))"
                  :rules="[requiredValidator]"
                  label="Unit"
                  placeholder="Select Unit"
                />
              </VCol>

              <!-- Role ID -->
              <VCol cols="12">
                <VSelect
                  v-model="formData.role_id"
                  :items="props.roles.map(role => ({ title: role.name, value: role.id }))"
                  :rules="[requiredValidator]"
                  label="Role"
                  placeholder="Select Role"
                />
              </VCol>

              <!-- User ID -->
              <VCol cols="12">
                <VSelect
                  v-model="formData.user_id"
                  :items="props.users.map(user => ({ title: user.name, value: user.id }))"
                  :rules="[requiredValidator]"
                  label="User"
                  placeholder="Select User"
                />
              </VCol>

              <!-- Submit and Cancel buttons -->
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

<style scoped>
/* Add any custom styles here */
</style>
