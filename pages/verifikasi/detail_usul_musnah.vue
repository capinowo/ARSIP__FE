<script setup>
import useArsipStatus from '@/composables/useArsipStatus'
import useClassification from '@/composables/useClassification'
import { getSelectedRoleToken } from '@/middleware/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// Middleware for auth on the page
definePageMeta({
    middleware: 'auth-middleware',
})

const router = useRouter()
const searchQuery = ref('')
const archives = ref([])
const isLoading = ref(false)
const totalArchives = ref(0)
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

import { useRoute } from 'vue-router'

const route = useRoute();
const selectedArchiveIds = route.query.ids ? route.query.ids.split(',') : [];

console.log("Selected Archive IDs:", selectedArchiveIds);


// Confirm deletion and send mutation to delete the archive
const confirmMutation = async () => {
    if (!archiveToMutate.value || !archiveToMutate.value.id) {
        console.warn('No archive selected for mutation:', archiveToMutate.value);
        return;
    }

    console.log("Mutating archive with ID:", archiveToMutate.value.id); // Debugging

    try {
        await mutateArchive(archiveToMutate.value.id);
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
    `

    isLoading.value = true
    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSelectedRoleToken()}`,
            },
            body: JSON.stringify({ query }),
        })

        const result = await response.json()

        if (result.errors) {
            console.log('📥 Raw Response:', await response.text())
            console.error('GraphQL errors:', result.errors)
        } else if (result.data && result.data.getArchives) {
            // Map archives and fetch classification description
            archives.value = await Promise.all(
                result.data.getArchives.data.map(async archive => {
                    const classification = await fetchClassification(archive.classification_id)
                    const status = await fetchArsipStatus(archive.archive_status_id)

                    return {
                        ...archive,
                        classification_description: classification?.description || 'N/A',
                        archive_status_name: status?.name || 'N/A',  // Set status name here
                    }
                }),
            )
            totalArchives.value = result.data.getArchives.total || 0
        } else {
            console.warn('No data returned from getArchives query:', result)
        }
    } catch (error) {
        console.error('Error fetching archives:', error)
        snackbarRef.value.showSnackbar('This is an error message', 'error fetch archives')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchArchives()
})
</script>

<template>
    <div>
        <v-container>
            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="searchQuery" label="Search" @input="fetchArchives"></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-data-table :headers="headers" :items="archives" :loading="isLoading" class="elevation-1">
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>{{ item.title }}</td>
                                <td>{{ item.description }}</td>
                                <td>{{ item.unit_id }}</td>
                                <td>{{ item.created_at }}</td>
                                <td>
                                    <v-btn color="primary" @click="openMutationDialog(item)">Detail</v-btn>
                                </td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-container>

        <v-row>
            <v-col cols="12">
                <v-textarea v-model="archiveToMutate.value.detailPemusnahan" label="Detail Pemusnahan"
                    rows="5"></v-textarea>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-file-input v-model="archiveToMutate.value.beritaAcara" label="Berita Acara (opsional)"
                    accept=".pdf,.doc,.docx"></v-file-input>
            </v-col>
        </v-row>

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
</template>

<style scoped>
/* Add your styles here */
</style>
