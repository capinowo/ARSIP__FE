<template>
  <VDialog v-model="isDialogOpen" max-width="400">
    <VCard>
      <VCardTitle>Confirm Deletion</VCardTitle>
      <VCardText>
        Are you sure you want to delete this classification?
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
  isOpen: Boolean,
  classificationId: {
    type: [Number, null], // Allow Number or null as types
    default: null,        // Set default to null
  },
});
const emits = defineEmits(['confirm', 'close']);

const isDialogOpen = ref(props.isOpen);

watch(() => props.isOpen, (newVal) => {
  isDialogOpen.value = newVal;
});

const confirmDeletion = () => {
  emits('confirm', props.classificationId); // Emit confirm event with classification ID
  closeDialog();
};

const closeDialog = () => {
  isDialogOpen.value = false;
  emits('close');
};
</script>
