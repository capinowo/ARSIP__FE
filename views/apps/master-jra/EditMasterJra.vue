<script setup>
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  classification: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['update:isDrawerOpen', 'update-classification']);

const refForm = ref();
const formData = ref({});

// Initialize formData once props.classification is available
onMounted(() => {
  if (props.classification) {
    formData.value = { ...props.classification };
  }
});

// Watch for changes in props.classification and update formData
watch(
  () => props.classification,
  (newClassification) => {
    formData.value = { ...newClassification };
  },
  { immediate: true }
);

const closeDrawer = () => {
  emit('update:isDrawerOpen', false);
};

const onSubmit = () => {
  emit('update-classification', formData.value); // Emit updated classification data
  closeDrawer();
};

// Required validator for the form
const requiredValidator = value => !!value || 'This field is required';
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="isDrawerOpen"
    @update:model-value="closeDrawer"
  >
    <!-- Drawer Header Section -->
    <VCard flat>
      <VCardTitle class="d-flex justify-space-between">
        <span>Edit Classification</span>
      </VCardTitle>
      <VDivider />

      <!-- Form Section -->
      <VCardText>
        <VForm ref="refForm" @submit.prevent="onSubmit">
          <VRow>
            <!-- Classification Code -->
            <VCol cols="12">
              <VTextField
                v-model="formData.classification_code"
                label="Classification Code"
                placeholder="Enter classification code"
              />
            </VCol>

            <!-- Description -->
            <VCol cols="12">
              <VTextField
                v-model="formData.description"
                label="Description"
                placeholder="Enter description"
              />
            </VCol>

            <!-- Retention Active -->
            <VCol cols="12">
              <VTextField
                v-model="formData.retention_active"
                type="number"
                :rules="[requiredValidator, value => value >= 0 || 'Must be a positive number']"
                label="Retention Active (in years)"
                placeholder="Enter number of years"
              />
            </VCol>

            <!-- Retention Inactive -->
            <VCol cols="12">
              <VTextField
                v-model="formData.retention_inactive"
                type="number"
                :rules="[requiredValidator, value => value >= 0 || 'Must be a positive number']"
                label="Retention Inactive (in years)"
                placeholder="Enter number of years"
              />
            </VCol>

            <!-- Retention Disposition ID -->
            <!-- <VCol cols="12">
              <VSelect
                v-model="formData.retention_disposition_id"
                :items="[ 
                  { title: 'Musnah', value: 1 },
                  { title: 'Permanen', value: 2 }
                ]"
                label="Retention Disposition ID"
                placeholder="Select Disposition"
              />
            </VCol> -->

            <!-- Security Classification ID -->
            <VCol cols="12">
              <VSelect
                v-model="formData.security_classification_id"
                :items="[ 
                  { title: 'Terbuka', value: 1 },
                  { title: 'Terbatas', value: 2 }
                ]"
                label="Security Classification ID"
                placeholder="Select Classification"
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
