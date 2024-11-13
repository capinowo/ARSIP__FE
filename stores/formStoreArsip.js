import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useFormStore = defineStore('form', () => {
  // State untuk menyimpan data form
  const selectedType = ref(null);
  const namaArsip = ref(null);
  const retentionPeriod = ref(null);
  const selectedUnit = ref(null);
  const selectedLocation = ref(null);
  const selectedClassification = ref(null);
  const selectedStatus = ref(null);
  const content = ref(null); // Untuk Deskripsi Arsip

  // Fungsi untuk menyimpan data ke localStorage
  const saveDraft = () => {
    const draftData = {
      selectedType: selectedType.value,
      namaArsip: namaArsip.value,
      retentionPeriod: retentionPeriod.value,
      selectedUnit: selectedUnit.value,
      selectedLocation: selectedLocation.value,
      selectedClassification: selectedClassification.value,
      selectedStatus: selectedStatus.value,
      content: content.value,
    };
    localStorage.setItem('draftForm', JSON.stringify(draftData));
  };

  const loadDraft = () => {
    if (typeof window !== 'undefined') { // Pastikan localStorage hanya diakses di klien
      const savedData = JSON.parse(localStorage.getItem('draftForm'));
      if (savedData) {
        selectedType.value = savedData.selectedType;
        namaArsip.value = savedData.namaArsip;
        retentionPeriod.value = savedData.retentionPeriod;
        selectedUnit.value = savedData.selectedUnit;
        selectedLocation.value = savedData.selectedLocation;
        selectedClassification.value = savedData.selectedClassification;
        selectedStatus.value = savedData.selectedStatus;
        content.value = savedData.content;
      }
    }
  };

  // Muat draft saat komponen di-mount
  onMounted(() => {
    loadDraft();
  });

  // Menggunakan watch untuk menyimpan data setiap kali ada perubahan
  watch(
    [selectedType, namaArsip, retentionPeriod, selectedUnit, selectedLocation, selectedClassification, selectedStatus, content],
    saveDraft,
    { deep: true }
  );

  // Fungsi untuk menghapus draft jika dibutuhkan
  const clearDraft = () => {
    localStorage.removeItem('draftForm');
    selectedType.value = null;
    namaArsip.value = null;
    retentionPeriod.value = null;
    selectedUnit.value = null;
    selectedLocation.value = null;
    selectedClassification.value = null;
    selectedStatus.value = null;
    content.value = null;
  };

  return {
    selectedType,
    namaArsip,
    retentionPeriod,
    selectedUnit,
    selectedLocation,
    selectedClassification,
    selectedStatus,
    content,
    saveDraft,
    loadDraft,
    clearDraft,
  };
});
