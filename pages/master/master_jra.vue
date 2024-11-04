<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import AddNewMasterJra from '@/views/apps/master-jra/AddNewMasterJra.vue';
import EditMasterJra from '@/views/apps/master-jra/EditMasterJra.vue';
import { onMounted, ref } from 'vue';

const isAddClassificationDrawerOpen = ref(false);
const isEditClassificationDrawerOpen = ref(false);
const searchQuery = ref('');
const classifications = ref([]);
const isLoading = ref(false);
const totalClassifications = ref(0);
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedClassification = ref({});

// Table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Classification Code', key: 'classification_code' },
  { title: 'Description', key: 'description' },
  { title: 'Retention Active', key: 'retention_active' },
  { title: 'Retention Inactive', key: 'retention_inactive' },
  { title: 'Retention Disposition ID', key: 'retention_disposition_id' },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Fetch classifications
const fetchClassifications = async () => {
  const query = `
    query {
      getClassifications {
        data {
          id
          classification_code
          description
          retention_active
          retention_inactive
          retention_disposition_id
          created_at
          updated_at
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
    classifications.value = result.data.getClassifications.data;
    totalClassifications.value = classifications.value.length;
  } catch (error) {
    console.error('Error fetching classifications:', error);
  } finally {
    isLoading.value = false;
  }
};

// Create classification
const createClassification = async (newClassificationData) => {
  const mutation = `
    mutation CreateClassification($data: ClassificationCreateInput!) {
      createClassification(data: $data) {
        classification_code
        created_at
        description
        id
        retention_active
        retention_disposition_id
        retention_inactive
      }
    }
  `;
  
  const variables = { data: newClassificationData };

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
    if (result.data.createClassification) {
      classifications.value.push(result.data.createClassification);
      totalClassifications.value += 1;
    }
  } catch (error) {
    console.error('Error creating classification:', error);
  } finally {
    isAddClassificationDrawerOpen.value = false;
  }
};

const openEditClassification = (classification) => {
  selectedClassification.value = { ...classification }; // Clone to avoid direct mutations
  isEditClassificationDrawerOpen.value = true;
};

// Open edit drawer with selected classification
const updateClassification = async (updatedClassificationData) => {
  const mutation = `
    mutation UpdateClassification($updateClassificationId: Int!, $data: ClassificationUpdateInput!) {
      updateClassification(id: $updateClassificationId, data: $data) {
        classification_code
        description
        retention_active
        retention_disposition_id
        retention_inactive
      }
    }
  `;

  const variables = {
    updateClassificationId: updatedClassificationData.id,
    data: {
      classification_code: updatedClassificationData.classification_code,
      description: updatedClassificationData.description,
      retention_active: updatedClassificationData.retention_active,
      retention_inactive: updatedClassificationData.retention_inactive,
      retention_disposition_id: updatedClassificationData.retention_disposition_id,
    },
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

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      return;
    }

    if (result.data && result.data.updateClassification) {
      const index = classifications.value.findIndex(
        (cls) => cls.id === updatedClassificationData.id
      );
      if (index !== -1) {
        classifications.value[index] = {
          ...classifications.value[index],
          ...result.data.updateClassification,
        };
      }
    } else {
      console.error('Unexpected response structure:', result);
    }
  } catch (error) {
    console.error('Error updating classification:', error);
  } finally {
    isEditClassificationDrawerOpen.value = false; // Close the drawer after updating
  }
};

// Delete a classification
const deleteClassification = async (classificationId) => {
  const mutation = `
    mutation DeleteClassification($deleteClassificationId: Int!) {
      deleteClassification(id: $deleteClassificationId) {
        id
      }
    }
  `;
  const variables = { deleteClassificationId: classificationId };

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
    if (result.data.deleteClassification) {
      classifications.value = classifications.value.filter(
        (cls) => cls.id !== classificationId
      );
      totalClassifications.value -= 1;
    }
  } catch (error) {
    console.error('Error deleting classification:', error);
  }
};

onMounted(() => {
  fetchClassifications();
});
</script>

<template>
  <section>
    <!-- Main page content -->
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-classification-search-filter d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search Classification"
            density="compact"
            class="me-4"
          />
          <VBtn @click="isAddClassificationDrawerOpen = true">
            Add New JRA
          </VBtn>
        </div>
      </VCard>
    </div>

    <!-- Table to display classifications -->
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="classifications"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalClassifications"
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
              <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="openEditClassification(item)"
              >
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn>
              <VBtn
                icon
                @click="deleteClassification(item.id)"
              >
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>

    <!-- AddNewClassification Drawer Component -->
    <AddNewMasterJra
      :is-drawer-open="isAddClassificationDrawerOpen"
      @update:is-drawer-open="isAddClassificationDrawerOpen = $event"
      @create-classification="createClassification"
    />

    <!-- EditClassification Drawer Component -->
    <EditMasterJra
      :is-drawer-open="isEditClassificationDrawerOpen"
      :classification="selectedClassification"
      @update:is-drawer-open="isEditClassificationDrawerOpen = $event"
      @update-classification="updateClassification"
    />
  </section>
</template>
