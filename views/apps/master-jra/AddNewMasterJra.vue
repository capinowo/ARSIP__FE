<script setup>
import { nextTick, ref } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  'update:isDrawerOpen',
  'create-classification',
]);

const isFormValid = ref(false);
const refForm = ref();
const classificationCode = ref('');
const description = ref('');
const retentionActive = ref(null);
const retentionInactive = ref(null);
const retentionDispositionId = ref(null);

// Close drawer function
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false);
  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

// Form submission
const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      // Convert string values to integers
      emit('create-classification', {
        classification_code: classificationCode.value,
        description: description.value,
        retention_active: parseInt(retentionActive.value, 10),
        retention_inactive: parseInt(retentionInactive.value, 10),
        retention_disposition_id: parseInt(retentionDispositionId.value, 10),
      });
      emit('update:isDrawerOpen', false);
      nextTick(() => {
        refForm.value?.reset();
        refForm.value?.resetValidation();
      });
    }
  });
};


// Update drawer visibility
const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val);
};
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
    <!-- Drawer Title -->
    <AppDrawerHeaderSection
      title="Add Master JRA"
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
              <!-- Classification Code -->
              <VCol cols="12">
                <VTextField
                  v-model="classificationCode"
                  :rules="[requiredValidator]"
                  label="Classification Code"
                  placeholder="Enter classification code"
                />
              </VCol>

              <!-- Description -->
              <VCol cols="12">
                <VTextField
                  v-model="description"
                  :rules="[requiredValidator]"
                  label="Description"
                  placeholder="Enter description"
                />
              </VCol>

              <!-- Retention Active -->
              <VCol cols="12">
                <VTextField
                  v-model="retentionActive"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Retention Active"
                  placeholder="Enter active retention period"
                />
              </VCol>

              <!-- Retention Inactive -->
              <VCol cols="12">
                <VTextField
                  v-model="retentionInactive"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Retention Inactive"
                  placeholder="Enter inactive retention period"
                />
              </VCol>

              <!-- Retention Disposition ID -->
              <VCol cols="12">
                <VTextField
                  v-model="retentionDispositionId"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Retention Disposition ID"
                  placeholder="Enter disposition ID"
                />
              </VCol>

              <!-- Submit and Cancel buttons -->
              <VCol cols="12">
                <VBtn type="submit" class="me-4">
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
