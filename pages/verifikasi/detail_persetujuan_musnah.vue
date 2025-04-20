<script setup>
import useArsipStatus from '@/composables/useArsipStatus'
import useClassification from '@/composables/useClassification'
import { getSelectedRoleToken } from '@/middleware/auth'
import { onMounted, ref } from 'vue'
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

const confirmMutation = async () => {
    if (archives.value.length === 0) {
        console.warn('❌ No archives available for disposal');
        return;
    }

    try {
        const batchId = Number(route.query.ids);
        if (!batchId) {
            console.error('❌ Invalid batch ID!');
            return;
        }

        console.log("🚀 Approving batch ID:", batchId);

        const query = `
            mutation accDisposalByPimpinanUK2($id: Int!, $pimpinanUk2Id: Int!) {
                accDisposalByPimpinanUK2(id: $id, pimpinanUk2Id: $pimpinanUk2Id) {
                    id
                    pimpinan_uk2_approval_status_id
                }
            }
        `;

        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSelectedRoleToken()}`,
            },
            body: JSON.stringify({
                query,
                variables: { id: batchId, pimpinanUk2Id: 1 },
            }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('❌ GraphQL errors:', result.errors);
            return;
        }

        const approvalResponse = result.data.accDisposalByPimpinanUK2;
        if (!approvalResponse || approvalResponse.pimpinan_uk2_approval_status_id !== 1) {
            console.error('❌ Failed to approve by Pimpinan UK2');
            return;
        }

        console.log("✅ Archive Disposal Approved by Pimpinan UK2!", approvalResponse);

        router.push({ path: '/verifikasi/arsip_usul_musnah' }).catch(err => console.warn("Router Error:", err));

    } catch (error) {
        console.error('❌ Mutation failed:', error);
    }
};






// Configure table headers
const headers = [
    { title: 'Judul', key: 'title' },
    { title: 'Deskripsi', key: 'description' },
    { title: 'Unit', key: 'unit_id' },
    { title: 'Dibuat Pada', key: 'created_at' },
    { title: 'Tanggal Pengajuan', key: 'submission_date' },
    { title: 'Status Persetujuan', key: 'approval_status' },
    { title: 'Disetujui Oleh', key: 'approved_by' }
];



const createArchiveDisposalBatch = async ({ archiveIds, userId }) => {
    const query = `
        mutation CreateArchiveDisposal($archiveIds: [Int!]!, $userId: Int!) {
            createArchiveDisposal(archiveIds: $archiveIds, userId: $userId) {
                id
                batch_code
                submission_date
                created_at
                updated_at
                verifikator_approval_status_id
                verifikator_id
                pimpinan_uk2_approval_status_id
                pimpinan_uk2_id
                pimpinan_uk1_approval_status_id
                pimpinan_uk1_id
                detail
                berita_acara_path
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


const batchId = ref(route.params.id); // Ambil batch_id dari URL
const fetchArchivesInBatch = async () => {
    const query = `
        query GetArchiveDisposals($where: ArchiveDisposalWhereInput) {
            getArchiveDisposals(where: $where) {
                data {
                    id
                    archive {
                        id
                        title
                        description
                        unit_id
                        created_at
                    }
                    archive_id
                    submission_date
                    approvalStatus {
                        id
                        name
                    }
                    approval_status_id
                    user {
                        id
                        name
                    }
                    approved_by
                    batch {
                        id
                        batch_code
                    }
                    batch_id
                    created_at
                    updated_at
                }
            }
        }
    `;

    const variables = {
        where:
        {
            batch_id: Number(batchId.value),
            approval_status_id: 2
        },
    };

    console.log("Query Variables:", variables); // 🔥 Debugging

    isLoading.value = true;
    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getSelectedRoleToken()}`,
            },
            body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error("❌ GraphQL errors:", result.errors);
        } else if (result.data && result.data.getArchiveDisposals) {
            archives.value = result.data.getArchiveDisposals.data.map(disposal => ({
                id: disposal.archive.id,
                title: disposal.archive.title,
                description: disposal.archive.description,
                unit_id: disposal.archive.unit_id,
                created_at: disposal.archive.created_at,
                submission_date: disposal.submission_date,
                approval_status: disposal.approvalStatus?.name || "Pending",
                approved_by: disposal.user?.name || "N/A",
                batch_code: disposal.batch?.batch_code || "N/A"
            }));
            totalArchives.value = archives.value.length;
        }
    } catch (error) {
        console.error("❌ Error fetching archives in batch:", error);
    } finally {
        isLoading.value = false;
    }
};




onMounted(() => {
    console.log("Route query:", route.query); // 🔥 Debugging
    if (route.query.ids) {
        batchId.value = Number(route.query.ids); // Konversi ke angka
        console.log("Batch ID from URL:", batchId.value); // 🔥 Debugging
        fetchArchivesInBatch();
    }
});




// Watch for changes in searchQuery and fetch archives
// watch(searchQuery, () => {
//     fetchArchives();
// });
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
                                <td>{{ item.submission_date }}</td>
                                <td>{{ item.approval_status }}</td>
                                <td>{{ item.approved_by }}</td>
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
        <v-btn color="red darken-1" @click="confirmMutation">
            Usulkan Pemusnahan
        </v-btn>


    </v-col>
</template>

<style scoped>
/* Add your styles here */
</style>
