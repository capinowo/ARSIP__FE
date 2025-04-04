<script setup>
import useArsipStatus from '@/composables/useArsipStatus'
import useClassification from '@/composables/useClassification'
import { getSelectedRoleToken } from '@/middleware/auth'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Middleware for auth on the page
definePageMeta({
    middleware: 'auth-middleware',
})

const router = useRouter()
const route = useRoute()
const selectedIds = ref([])
const searchQuery = ref('')
const archives = ref([])
const isLoading = ref(false)
const totalArchives = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const { fetchClassification } = useClassification()
const { fetchArsipStatus } = useArsipStatus()
const snackbarRef = ref(null)
const isDialogOpen = ref(false)
const archiveToMutate = ref(null)

const openMutationDialog = item => {
    archiveToMutate.value = item  // Set the archive item to be deleted
    isDialogOpen.value = true     // Open the dialog
}

const closeDialog = () => {
    isDialogOpen.value = false   // Close the dialog
}

const selectedArchives = ref([]);

// Confirm deletion and send mutation to delete the archive
const confirmMutation = async () => {
    if (!archiveToMutate.value || !archiveToMutate.value.id) {
        console.warn('No archive selected for mutation:', archiveToMutate.value);
        return;
    }

    console.log("Mutating archive with ID:", archiveToMutate.value.id); // Debugging

    try {
        // Panggil createArchiveDisposalBatch dengan data yang sesuai
        await createArchiveDisposalBatch({
            archiveIds: [archiveToMutate.value.id], // Kirim array berisi satu ID arsip
            userId: 1 // Gantilah dengan fungsi untuk mengambil ID user
        });


        console.log("Archive Disposal Batch created successfully!");
    } catch (error) {
        console.error('Mutation failed:', error);
    } finally {
        closeDialog();
    }
};

// Configure table headers
const headers = [
    { title: 'Judul', key: 'title' },
    { title: 'Deskripsi', key: 'description' },
    { title: 'Unit', key: 'unit_id' },
    { title: 'Dibuat Pada', key: 'created_at' },
]

const createArchiveDisposalBatch = async ({ archiveIds, userId }) => {
    const query = `
        mutation CreateArchiveDisposalBatch($archiveIds: [Int!]!, $userId: Int!) {
            createArchiveDisposalBatch(archiveIds: $archiveIds, userId: $userId) {
                id
                batch_code
                submission_date
                created_at
            }
        }
    `;

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSelectedRoleToken()}`,
            },
            body: JSON.stringify({ query, variables: { archiveIds, userId } }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
        } else if (result.data && result.data.createArchiveDisposalBatch) {
            console.log('Archive Disposal Batch created:', result.data.createArchiveDisposalBatch);
        } else {
            console.warn('No data returned from createArchiveDisposalBatch mutation:', result);
        }
    } catch (error) {
        console.error('Error creating Archive Disposal Batch:', error);
    }
};


// GraphQL query to fetch archives data
const fetchArchives = async () => {
    const query = `
        query {
            getArchives (where: { archive_status_id: 4, approval_status_id: 2 }) {
                total
                data {
                    id
                    title
                    description
                    classification_id
                    document_path
                    archive_status_id
                    archive_type_id
                    unit_id
                    location_id
                    user_id
                    approval_status_id
                    created_at
                    updated_at
                    jumlah_arsip
                    media_arsip
                    tingkat_perkembangan
                    jumlah_lampiran
                    media_lampiran
                    final_retensi_aktif
                    final_retensi_inaktif
                }
            }
        }
    `;

    isLoading.value = true;
    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSelectedRoleToken()}`,
            },
            body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (result.errors) {
            console.log('📥 Raw Response:', await response.text());
            console.error('GraphQL errors:', result.errors);
        } else if (result.data && result.data.getArchives) {
            // 🔥 Filter data sesuai selectedIds
            const filteredData = result.data.getArchives.data.filter(archive =>
                selectedIds.value.includes(archive.id)
            );

            // Ambil deskripsi klasifikasi dan status arsip
            archives.value = await Promise.all(
                filteredData.map(async archive => {
                    const classification = await fetchClassification(archive.classification_id);
                    const status = await fetchArsipStatus(archive.archive_status_id);

                    return {
                        ...archive,
                        classification_description: classification?.description || 'N/A',
                        archive_status_name: status?.name || 'N/A',
                    };
                })
            );
            totalArchives.value = archives.value.length;
        } else {
            console.warn('No data returned from getArchives query:', result);
        }
    } catch (error) {
        console.error('Error fetching archives:', error);
        snackbarRef.value.showSnackbar('This is an error message', 'error fetch archives');
    } finally {
        isLoading.value = false;
    }
};



onMounted(() => {
    if (route.query.ids) {
        selectedIds.value = route.query.ids.split(",").map(id => Number(id)) // Konversi ke array angka
        console.log("Selected archives:", selectedIds.value)
        fetchArchives();
    }
})

// Watch for changes in searchQuery and fetch archives
watch(searchQuery, () => {
    fetchArchives();
});
</script>

<template>
    <div>
        <v-container>
            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="searchQuery" label="Search"></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-data-table :headers="headers" :items="archives" :items-per-page="itemsPerPage"
                        :loading="isLoading" class="elevation-1">
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>{{ item.title }}</td>
                                <td>{{ item.description }}</td>
                                <td>{{ item.unit_id }}</td>
                                <td>{{ item.created_at }}</td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>

            <!-- <v-row>
                <v-col cols="12">
                    <h3>Selected Archives:</h3>
                    <ul>
                        <li v-for="archive in selectedArchives" :key="archive">
                            ID Arsip: {{ archive }}
                        </li>
                    </ul>
                </v-col>
            </v-row> -->

        </v-container>

        <v-dialog v-model="isDialogOpen" max-width="500px">
            <v-card>
                <v-card-title class="headline">Confirm Mutation</v-card-title>
                <v-card-text>Are you sure you want to mutate this archive?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="confirmMutation">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>


    <v-row></v-row>
    <v-col cols="12">
        <v-textarea label="Deskripsi Arsip" placeholder="Deskripsi Arsip"
            :rules="[value => !!value || 'Deskripsi Arsip wajib diisi']" />
    </v-col>
    <v-col cols="12">
        <v-file-input show-size label="Upload Arsip" class="mb-4" @change="handleFileChange" />
    </v-col>

    <v-col cols="12">
        <v-btn color="red darken-1" @click="openMutationDialog(archives[0])">
            Usulkan Pemusnahan
        </v-btn>

    </v-col>
</template>

<style scoped>
/* Add your styles here */
</style>
