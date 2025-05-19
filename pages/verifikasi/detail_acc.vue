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

const verifyAllArchives = async () => {
    if (!archives.value.length) {
        console.warn('Tidak ada arsip yang bisa diverifikasi.');
        return;
    }

    const query = `
        mutation VerifyNewArchive($id: Int!) {
            verifyNewArchive(id: $id) {
                id
                title
                approval_status_id
            }
        }
    `;

    const results = []

    for (const archive of archives.value) {
        try {
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSelectedRoleToken()}`,
                },
                body: JSON.stringify({
                    query,
                    variables: { id: archive.id },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                console.error(`❌ Gagal verifikasi arsip ID ${archive.id}:`, result.errors);
                results.push({ id: archive.id, status: 'failed', error: result.errors });
            } else {
                console.log(`✅ Arsip ID ${archive.id} berhasil diverifikasi`);
                results.push({ id: archive.id, status: 'success' });
            }

        } catch (err) {
            console.error(`❌ Error network/verifikasi ID ${archive.id}:`, err);
            results.push({ id: archive.id, status: 'error', error: err });
        }
    }

    console.log('[✔️ Summary]', results);

    // 🚀 Redirect ke halaman list arsip
    router.push('/arsip/list_arsip');
};



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
const fetchArchivesByIds = async (ids) => {
    const allArchives = []

    const query = `
        query GetArchive($getArchiveId: Int!) {
            getArchive(id: $getArchiveId) {
                user_id
                unit_id
                title
                location_id
                id
                description
                classification_id
                archive_type_id
                archive_status_id
                jumlah_arsip
                media_arsip
                tingkat_perkembangan
                archiveType {
                id
                name
                }
                archiveStatus {
                id
                name
                }
                classification {
                id
                description
                classification_code
                retentionDisposition {
                    id
                    name
                }
                retention_active
                retention_disposition_id
                retention_inactive
                securityClassification {
                    id
                    name
                }
                security_classification_id
                }
                location {
                id
                name
                rack_name
                room_name
                unit_id
                description
                building_name
                box_name
                }
                user {
                name
                identity
                roles {
                    id
                    name
                }
                }
                unit {
                id
                name
                }
                created_at
            }
            }
            `;

    for (const id of ids) {
        try {
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getSelectedRoleToken()}`,
                },
                body: JSON.stringify({
                    query,
                    variables: { getArchiveId: id },
                }),
            });

            const result = await response.json();

            if (result.data && result.data.getArchive) {
                allArchives.push(result.data.getArchive);
            } else {
                console.warn(`Archive with ID ${id} not found`);
            }
        } catch (error) {
            console.error(`Error fetching archive with ID ${id}:`, error);
        }
    }

    return allArchives;
};







onMounted(async () => {
    if (route.query.ids) {
        selectedIds.value = route.query.ids.split(',').map(Number);
        console.log('[✅] Selected IDs:', selectedIds.value);

        const fetched = await fetchArchivesByIds(selectedIds.value);
        archives.value = fetched;
        totalArchives.value = fetched.length;
    }
});


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
                        :loading="isLoading" class="elevation-1 mb-4">
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>{{ item.title }}</td>
                                <td>{{ item.description }}</td>
                                <td>{{ item.created_at }}</td>
                            </tr>
                        </template>
                    </v-data-table>

                    <v-row v-if="archives.length" class="mt-4">
                        <v-col v-for="(item, index) in archives" :key="item.id" cols="12">
                            <v-card class="mb-6" outlined>
                                <v-card-title class="text-h6">
                                    Arsip {{ index + 1 }} — {{ item.title }}
                                </v-card-title>
                                <v-card-subtitle>{{ item.description }}</v-card-subtitle>
                                <v-card-text>
                                    <div class="detail-row"><span class="label">Judul:</span><span class="value">{{
                                        item.title || '-'
                                            }}</span></div>
                                    <div class="detail-row"><span class="label">Deskripsi:</span><span class="value">{{
                                        item.description ||
                                        '-' }}</span></div>
                                    <div class="detail-row"><span class="label">Tanggal:</span><span class="value">{{
                                        item.document_date ||
                                        item.created_at || '-' }}</span></div>
                                    <div class="detail-row">
                                        <span class="label">Klasifikasi:</span>
                                        <span class="value">
                                            {{ item.classification?.classification_code || '-' }} - {{
                                                item.classification?.description ||
                                                '-' }}
                                        </span>
                                    </div>
                                    <div class="detail-row"><span class="label">Unit:</span><span class="value">{{
                                        item.unit?.name || '-'
                                            }}</span></div>
                                    <div class="detail-row"><span class="label">Tipe Arsip:</span><span class="value">{{
                                        item.archiveType?.name || '-' }}</span></div>
                                    <div class="detail-row">
                                        <span class="label">Lokasi Penyimpanan:</span>
                                        <span class="value">
                                            {{ item.location?.building_name || '-' }} - {{ item.location?.box_name ||
                                                '-' }} - {{
                                                item.location?.rack_name || '-' }}
                                        </span>
                                    </div>
                                    <div class="detail-row"><span class="label">Jumlah Arsip:</span><span
                                            class="value">{{ item.jumlah_arsip
                                                || '-' }}</span></div>
                                    <div class="detail-row"><span class="label">Media Arsip:</span><span
                                            class="value">{{ item.media_arsip
                                                || '-' }}</span></div>
                                    <div class="detail-row"><span class="label">Tingkat Perkembangan /
                                            Kondisi:</span><span class="value">{{
                                                item.tingkat_perkembangan || '-' }}</span></div>
                                    <div class="detail-row"><span class="label">Nilai Guna:</span><span class="value">{{
                                        item.classification?.retentionDisposition?.name || '-' }}</span></div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>



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
        <v-btn color="green darken-1" @click="verifyAllArchives">
            Setujui Semua Usulan
        </v-btn>

    </v-col>

</template>

<style scoped>
.detail-row {
    display: flex;
    margin-bottom: 6px;
}

.label {
    width: 230px;
    /* Sesuaikan agar semua label rata kiri */
    font-weight: 600;
    flex-shrink: 0;
}

.value {
    flex: 1;
}
</style>
