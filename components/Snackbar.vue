<script setup>
import { ref } from 'vue';

// Snackbar state variables
const visible = ref(false)
const message = ref('')
const color = ref('error')

// Method to show Snackbar
function showSnackbar(msg, colorType = 'error') {
  message.value = msg
  color.value = colorType
  visible.value = true
}

// Export showSnackbar so it can be used in the parent
defineExpose({
  showSnackbar
})
</script>

<template>
  <VSnackbar
    v-model="visible"
    :color="color"
    :timeout="3000"
    top
    right
    class="custom-snackbar"
  >
    {{ message }}
  </VSnackbar>
</template>

<style scoped>
/* Custom styles for Snackbar */
.custom-snackbar {
  inset-block-start: 20px;  /* Adjust this value to move the Snackbar higher or lower */
}
</style>
