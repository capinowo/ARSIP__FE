import { defineStore } from 'pinia'
import { onMounted, ref, watch } from 'vue'

export const useFormStore = defineStore('form', () => {
  // State untuk menyimpan data form
  const selectedType = ref(null)
  const namaArsip = ref(null)
  const retentionActivePeriod = ref(null)
  const retentionInactivePeriod = ref(null)
  const retentionActiveDate = ref(null)
  const retentionInactiveDate = ref(null)
  const selectedUnit = ref(null)
  const selectedLocation = ref(null)
  const selectedClassification = ref(null)
  const selectedStatus = ref(null)
  const jumlahArsip = ref(null)
  const selectedMediaArsip = ref(null)
  const selectedTingkatPerkembangan = ref(null)
  const jumlahLampiran = ref(null)
  const selectedMediaLampiran = ref(null)
  const content = ref(null) // Untuk Deskripsi Arsip

  // Fungsi untuk menyimpan data ke localStorage
  const saveDraft = () => {
    const draftData = {
      selectedType: selectedType.value,
      namaArsip: namaArsip.value,
      retentionActivePeriod: retentionActivePeriod.value,
      retentionInactivePeriod: retentionInactivePeriod.value,
      retentionActiveDate: retentionActiveDate.value,
      retentionInactiveDate: retentionInactiveDate.value,
      selectedUnit: selectedUnit.value,
      selectedLocation: selectedLocation.value,
      selectedClassification: selectedClassification.value,
      selectedStatus: selectedStatus.value,
      jumlahArsip: jumlahArsip.value,
      selectedMediaArsip: selectedMediaArsip.value,
      selectedTingkatPerkembangan: selectedTingkatPerkembangan.value,
      jumlahLampiran: jumlahLampiran.value,
      selectedMediaLampiran: selectedMediaLampiran.value,
      content: content.value,
    }

    localStorage.setItem('draftForm', JSON.stringify(draftData))
  }

  const loadDraft = () => {
    if (typeof window !== 'undefined') { // Pastikan localStorage hanya diakses di klien
      const savedData = JSON.parse(localStorage.getItem('draftForm'))
      if (savedData) {
        selectedType.value = savedData.selectedType
        namaArsip.value = savedData.namaArsip
        retentionActivePeriod.value = savedData.retentionActivePeriod
        retentionInactivePeriod.value = savedData.retentionInactivePeriod
        retentionActiveDate.value = savedData.retentionActiveDate
        retentionInactiveDate.value = savedData.retentionInactiveDate
        selectedUnit.value = savedData.selectedUnit
        selectedLocation.value = savedData.selectedLocation
        selectedClassification.value = savedData.selectedClassification
        selectedStatus.value = savedData.selectedStatus
        jumlahArsip.value = savedData.jumlahArsip
        selectedMediaArsip.value = savedData.selectedMediaArsip
        selectedTingkatPerkembangan.value = savedData.selectedTingkatPerkembangan
        jumlahLampiran.value = savedData.jumlahLampiran
        selectedMediaLampiran.value = savedData.selectedMediaLampiran
        content.value = savedData.content
      }
    }
  }

  // Muat draft saat komponen di-mount
  onMounted(() => {
    loadDraft()
  })

  // Menggunakan watch untuk menyimpan data setiap kali ada perubahan
  watch(
    [selectedType, namaArsip, retentionActivePeriod, retentionInactivePeriod, selectedUnit, selectedLocation, selectedClassification, selectedStatus, content],
    saveDraft,
    { deep: true },
  )

  // Fungsi untuk menghapus draft jika dibutuhkan
  const clearDraft = () => {
    localStorage.removeItem('draftForm')
    selectedType.value = null
    namaArsip.value = null
    retentionActivePeriod.value = null
    retentionInactivePeriod.value = null
    retentionActiveDate.value = ref(null)
    retentionInactiveDate.value = ref(null)
    selectedUnit.value = null
    selectedLocation.value = null
    selectedClassification.value = null
    selectedStatus.value = null
    jumlahArsip.value = null
    selectedMediaArsip.value = null
    selectedTingkatPerkembangan.value = null
    jumlahLampiran.value = null
    selectedMediaLampiran.value = null
    content.value = null
  }

  return {
    selectedType,
    namaArsip,
    retentionActivePeriod,
    retentionInactivePeriod,
    retentionActiveDate,
    retentionInactiveDate,
    selectedUnit,
    selectedLocation,
    selectedClassification,
    selectedStatus,
    jumlahArsip,
    selectedMediaArsip,
    selectedTingkatPerkembangan,
    jumlahLampiran,
    selectedMediaLampiran,
    content,
    saveDraft,
    loadDraft,
    clearDraft,
  }
})
