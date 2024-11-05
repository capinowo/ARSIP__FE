<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import AddNewMasterLokasi from '@/views/apps/master-lokasi/AddNewMasterLokasi.vue';
import DeleteLokasi from '@/views/apps/master-lokasi/DeleteMasterLokasi.vue';
import EditLocation from '@/views/apps/master-lokasi/EditMasterLokasi.vue';
import { onMounted, ref } from 'vue';

const isDeleteDialogOpen = ref(false);
const locationToDelete = ref(null);
const isAddLocationDrawerOpen = ref(false);
const isEditLocationDrawerOpen = ref(false);
const searchQuery = ref('');
const locations = ref([]);
const isLoading = ref(false);
const totalLocations = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedLocation = ref({});

// Table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Building Name', key: 'building_name' },
  { title: 'Room Name', key: 'room_name' },
  { title: 'Rack Name', key: 'rack_name' },
  { title: 'Box Name', key: 'box_name' },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Open delete confirmation dialog
const openDeleteDialog = (locationId) => {
  locationToDelete.value = locationId;
  isDeleteDialogOpen.value = true;
};

// Handle confirmed delete action
const handleDeleteLocation = async (locationId) => {
  const mutation = `
    mutation DeleteLocation($deleteLocationId: Int!) {
      deleteLocation(id: $deleteLocationId) {
        id
      }
    }
  `;
  const variables = { deleteLocationId: locationId };

  try {
    const token = getSelectedRoleToken();
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();
    if (result.data.deleteLocation) {
      locations.value = locations.value.filter((loc) => loc.id !== locationId);
      console.log(`Location with ID ${locationId} deleted successfully.`);
    }
  } catch (error) {
    console.error('Error deleting location:', error);
  } finally {
    isDeleteDialogOpen.value = false;
    locationToDelete.value = null;
  }
};

//CREATE LOCATION
const createLocation = async (newLocationData) => {
  const mutation = `
    mutation CreateLocation($data: LocationCreateInput!) {
      createLocation(data: $data) {
        id
        name
        description
        building_name
        room_name
        rack_name
        box_name
        unit_id
        created_at
        updated_at
      }
    }
  `;
  const variables = { data: newLocationData };

  try {
    const token = getSelectedRoleToken();
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();
    if (result.data.createLocation) {
      locations.value.push(result.data.createLocation);
    }
  } catch (error) {
    console.error('Error creating location:', error);
  } finally {
    isAddLocationDrawerOpen.value = false;
  }
};

// Fetch locations
const fetchLocations = async () => {
  const query = `
    query GetLocations {
      getLocations {
        data {
          id
          name
          description
          building_name
          room_name
          rack_name
          box_name
          unit_id
        }
      }
    }
  `;

  isLoading.value = true;
  try {
    const token = getSelectedRoleToken();
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    locations.value = result.data.getLocations.data;
    totalLocations.value = locations.value.length;
  } catch (error) {
    console.error('Error fetching locations:', error);
  } finally {
    isLoading.value = false;
  }
};

// Function to open the edit drawer with the selected location
const openEditLocation = (location) => {
  selectedLocation.value = { ...location };
  isEditLocationDrawerOpen.value = true;
};

// Function to update a location
const updateLocation = async (updatedLocationData) => {
  const mutation = `
    mutation UpdateLocation($data: LocationUpdateInput!, $updateLocationId: Int!) {
      updateLocation(data: $data, id: $updateLocationId) {
        box_name
        building_name
        description
        name
        rack_name
        room_name
        updated_at
      }
    }
  `;

  const variables = {
    data: {
      box_name: updatedLocationData.box_name,
      building_name: updatedLocationData.building_name,
      description: updatedLocationData.description,
      name: updatedLocationData.name,
      rack_name: updatedLocationData.rack_name,
      room_name: updatedLocationData.room_name,
      unit_id: updatedLocationData.unit_id,
    },
    updateLocationId: updatedLocationData.id,
  };

  try {
    const token = getSelectedRoleToken();
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();
    const updatedLocation = result.data.updateLocation;

    // Update the location in the list
    const index = locations.value.findIndex(loc => loc.id === updatedLocationData.id);
    if (index !== -1) {
      locations.value[index] = { ...locations.value[index], ...updatedLocation };
    }
  } catch (error) {
    console.error('Error updating location:', error);
  } finally {
    isEditLocationDrawerOpen.value = false;
  }
};

onMounted(() => {
  fetchLocations();
});
</script>

<template>
  <section>
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-location-search-filter d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search Location"
            density="compact"
            class="me-4"
          />
          <VBtn @click="isAddLocationDrawerOpen = true">
            Add New Location
          </VBtn>
        </div>
      </VCard>
    </div>

    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="locations"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalLocations"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          item-key="id"
          @update:page="currentPage = $event"
          @update:items-per-page="itemsPerPage = $event"
        >
          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex">
              <VBtn icon @click="openEditLocation(item)">
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn>
              <VBtn icon @click="openDeleteDialog(item.id)">
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>

    <AddNewMasterLokasi
      :is-drawer-open="isAddLocationDrawerOpen"
      @update:is-drawer-open="isAddLocationDrawerOpen = $event"
      @create-location="createLocation"
    />

    <EditLocation
      :is-drawer-open="isEditLocationDrawerOpen"
      :location="selectedLocation"
      @update:is-drawer-open="isEditLocationDrawerOpen = $event"
      @update-location="updateLocation"
    />

    <DeleteLokasi
      :isOpen="isDeleteDialogOpen"
      :locationId="locationToDelete"
      @confirm="handleDeleteLocation"
      @close="isDeleteDialogOpen = false"
    />
  </section>
</template>
