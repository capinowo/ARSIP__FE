<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import { defineProps, nextTick, onMounted, ref } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:isDrawerOpen', 'create-location', 'refresh-locations']);

const refForm = ref();
const unit_id = ref(null); // Selected unit ID
const name = ref('');
const description = ref('');
const building_name = ref('');
const room_name = ref('');
const rack_name = ref('');
const box_name = ref('');
const units = ref([]); // Array to store units from API

// Fetch list of units from API
const fetchUnits = async () => {
  const query = `
    query GetUnits {
      getUnits {
        data {
          id
          name
          description
        }
      }
    }
  `;

  try {
    const token = getSelectedRoleToken();
    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    // Check if result contains data and getUnits exists
    if (result.data && result.data.getUnits && result.data.getUnits.data) {
      units.value = result.data.getUnits.data.map(unit => ({
        title: unit.name,
        value: unit.id,
      }));
    } else if (result.errors) {
      console.error('GraphQL errors:', result.errors);
    } else {
      console.error('Unexpected response structure:', result);
    }
  } catch (error) {
    console.error('Error fetching units:', error);
  }
};

// Close drawer function
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false);
  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

// Form submission handler
const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('create-location', {
        unit_id: unit_id.value,
        name: name.value,
        description: description.value,
        building_name: building_name.value,
        room_name: room_name.value,
        rack_name: rack_name.value,
        box_name: box_name.value,
      });
      closeNavigationDrawer();
      
      // Emit event untuk memuat ulang data di halaman master_lokasi
      emit('refresh-locations');  // Tambahkan emit untuk refresh data
    }
  });
};


const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val);
};

// Fetch units when component is mounted
onMounted(() => {
  fetchUnits();
});
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
      title="Add New Location"
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
              <!-- Unit ID Field as Select Dropdown -->
              <VCol cols="12">
                <VSelect
                  v-model="unit_id"
                  :items="units"
                  label="Unit"
                  placeholder="Select a unit"
                  :rules="[v => !!v || 'Unit is required']"
                  required
                />
              </VCol>

              <!-- Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="name"
                  label="Nama Lokasi"
                  placeholder="Enter location name"
                  :rules="[v => !!v || 'Location name is required']"
                  required
                />
              </VCol>

              <!-- Description Field -->
              <VCol cols="12">
                <VTextField
                  v-model="description"
                  label="Deskripsi"
                  placeholder="Enter description"
                />
              </VCol>

              <!-- Building Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="building_name"
                  label="Nama Gedung"
                  placeholder="Enter building name"
                />
              </VCol>

              <!-- Room Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="room_name"
                  label="Nama Ruangan"
                  placeholder="Enter room name"
                />
              </VCol>

              <!-- Rack Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="rack_name"
                  label="Nama Loker"
                  placeholder="Enter rack name"
                />
              </VCol>

              <!-- Box Name Field -->
              <VCol cols="12">
                <VTextField
                  v-model="box_name"
                  label="Nama Kotak"
                  placeholder="Enter box name"
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
