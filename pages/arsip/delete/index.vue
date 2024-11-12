<template>
  <!-- Confirmation Dialog for Deletion -->
  <VDialog v-model="isDialogOpen" max-width="400">
    <VCard>
      <VCardTitle>Confirm Deletion</VCardTitle>
      <VCardText>
        Are you sure you want to delete this archive?
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" @click="confirmDeletion">Yes</VBtn>
        <VBtn @click="closeDialog">No</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,  // Dialog open state
  archiveId: {
    type: [Number, null], // Allow archive ID or null
    default: null,        // Default value is null
  },
});
const emits = defineEmits(['confirm', 'close']);

const isDialogOpen = ref(props.isOpen);

// Watch for changes to the dialog open state
watch(() => props.isOpen, (newVal) => {
  isDialogOpen.value = newVal;
});

// Function to confirm the deletion
const confirmDeletion = () => {
  emits('confirm', props.archiveId); // Emit the archive ID when confirmed
  closeDialog();
};

// Function to close the dialog without confirming
const closeDialog = () => {
  isDialogOpen.value = false;
  emits('close'); // Emit close event
};
</script>
