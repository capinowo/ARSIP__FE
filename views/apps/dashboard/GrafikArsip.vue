<script setup>
import { hexToRgb } from '@core/utils/colorConverter'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

import { onMounted, ref } from 'vue'

const archivesPerMonth = ref({})
const disposalsPerMonth = ref({})
const isLoading = ref(true)

const archiveDates = ref([])
const disposalDates = ref([])

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function groupByMonth(data, dateKey) {
  const result = new Array(12).fill(0)

  data.forEach(item => {
    const date = new Date(item[dateKey])
    const month = date.getMonth() // 0 (Jan) - 11 (Dec)
    if (!isNaN(month)) {
      result[month]++
    }
  })

  return result
}



const fetchData = async () => {
  isLoading.value = true

  // Fetch Archives
  // Fetch Archives
  const resArchives = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getSelectedRoleToken()}`, // Pastikan Anda mengganti ini dengan token yang sesuai
    },
    body: JSON.stringify({
      query: `
    query GetArchives($where: ArchiveWhereInput) {
      getArchives(where: $where) {
        data {
          created_at
        }
      }
    }
  `,
      variables: {
        where: {},
      },
    }),

  })

  const archivesData = await resArchives.json()
  console.log('archivesData:', archivesData) // ⬅️ cek isi responnya dulu

  if (
    archivesData &&
    archivesData.data &&
    archivesData.data.getArchives &&
    Array.isArray(archivesData.data.getArchives.data)
  ) {
    archiveDates.value = archivesData.data.getArchives.data
  } else {
    console.error('Gagal fetch archive, data tidak sesuai format:', archivesData)
    archiveDates.value = []
  }
  veDates.value = archivesData.data.getArchives.data

  console.log('GraphQL archive errorsa:', archivesData.errors)

  // Fetch Disposals
  // Fetch Disposals
  const resDisposals = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      query GetArchiveDisposals {
        getArchiveDisposals {
          data {
            updated_at
          }
        }
      }
    `,
    }),
  })

  const disposalsData = await resDisposals.json()
  console.log('disposalsData:', disposalsData)

  if (
    disposalsData &&
    disposalsData.data &&
    disposalsData.data.getArchiveDisposals &&
    Array.isArray(disposalsData.data.getArchiveDisposals.data)
  ) {
    disposalDates.value = disposalsData.data.getArchiveDisposals.data
  } else {
    console.error('Gagal fetch disposal, data tidak sesuai format:', disposalsData)
    disposalDates.value = []
  }

  // Update chart series
  chartSeries.value[0].data = groupByMonth(archiveDates.value, 'created_at')
  chartSeries.value[1].data = groupByMonth(disposalDates.value, 'updated_at')

  console.log('Archive grouped:', groupByMonth(archiveDates.value, 'created_at'))
  console.log('Disposal grouped:', groupByMonth(disposalDates.value, 'updated_at'))

  isLoading.value = false
}


const chartSeries = ref([
  {
    name: 'Arsip Masuk',
    data: [], // Will be filled dynamically
  },
  {
    name: 'Penyusutan Arsip',
    data: [],
  },
])



onMounted(fetchData)

const options = computed(() => {
  const currentTheme = ref(vuetifyTheme.current.value.colors)
  const variableTheme = ref(vuetifyTheme.current.value.variables)
  const disabledColor = `rgba(${hexToRgb(currentTheme.value['on-surface'])},${variableTheme.value['disabled-opacity']})`
  const borderColor = `rgba(${hexToRgb(String(variableTheme.value['border-color']))},${variableTheme.value['border-opacity']})`

  return {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '30%',
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all',
      },
    },
    xaxis: {
      axisTicks: { show: false },
      crosshairs: { opacity: 0 },
      axisBorder: { show: false },
      categories: monthLabels,
      labels: {
        style: {
          fontSize: '13px',
          colors: disabledColor,
          fontFamily: 'inter',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
          colors: disabledColor,
          fontFamily: 'inter',
        },
        formatter: value => value > 999 ? `${(value / 1000).toFixed(0)}k` : `${value}`,
      },
    },
    colors: [
      'rgba(var(--v-theme-primary),1)',
      currentTheme.value.success,
      currentTheme.value.secondary,
    ],
    grid: {
      xaxis: { lines: { show: false } },
      borderColor,
      strokeDashArray: 7,
      padding: { bottom: -10 },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 6,
      curve: 'smooth',
      lineCap: 'round',
      colors: [currentTheme.value.surface],
    },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    responsive: [
      {
        breakpoint: 1560,
        options: { plotOptions: { bar: { columnWidth: '35%' } } },
      },
      {
        breakpoint: 1441,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '40%',
              borderRadius: 8,
            },
          },
        },
      },
      {
        breakpoint: 1280,
        charts: { height: 200 },
        options: {
          plotOptions: {
            bar: {
              columnWidth: '40%',
              borderRadius: 8,
            },
          },
        },
      },
      {
        breakpoint: 1160,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '40%',
              borderRadius: 6,
            },
          },
        },
      },
      {
        breakpoint: 960,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '30%',
              borderRadius: 6,
            },
          },
        },
      },
      {
        breakpoint: 800,
        chart: {
          height: 250,
          offsetX: -10,
        },
        options: { plotOptions: { bar: { columnWidth: '40%' } } },
      },
      {
        breakpoint: 650,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '50%',
              borderRadius: 6,
            },
          },
        },
      },
      {
        breakpoint: 600,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '35%',
              borderRadius: 6,
            },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250,
            offsetX: -10,
          },
          plotOptions: { bar: { columnWidth: '45%' } },
          xaxis: {
            labels: {
              rotate: 315,
              rotateAlways: true,
            },
          },
        },
      },
      {
        breakpoint: 420,
        options: { plotOptions: { bar: { columnWidth: '60%' } } },
      },
    ],
  }
})

const series = [
  {
    name: 'Arsip Masuk',
    data: [
      29000,
      22000,
      25000,
      18500,
      29000,
      20000,
      34500,
    ],
  },
  {
    name: 'Penysutan Arsip',
    data: [
      0,
      16000,
      11000,
      15500,
      0,
      12500,
      9500,
    ],
  },
  {
    name: 'Arsip Dihapus',
    data: [
      0,
      0,
      0,
      14000,
      0,
      11500,
      12000,
    ],
  },
]

const lastThreeTransactions = [
  {
    avatar: {
      icon: 'ri-bookmark-2-line',
      color: 'success',
    },
    title: '200000',
    subtitle: 'Penyusutan Arsip',
  },
  {
    avatar: {
      icon: 'ri-archive-line',
      color: 'primary',
    },
    title: '800000',
    subtitle: 'Arsip Masuk',
  },
  {
    avatar: {
      icon: 'ri-delete-bin-line',
      color: 'danger',
    },
    title: '800000',
    subtitle: 'Arsip Dihapus',
  },
]
</script>

<template>
  <VCard>
    <VRow no-gutters>
      <VCol cols="12" sm="8" class="responsive-border">
        <VCardItem>
          <VCardTitle>
            Grafik Arsip Total
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <VueApexCharts type="bar" :options="options" :series="chartSeries" :height="292" />

        </VCardText>
      </VCol>

      <VCol cols="12" sm="4">
        <VCardItem>
          <VCardTitle>
            1.800.556 Files
          </VCardTitle>
          <VCardSubtitle>Total ARSIP Dari semua tahun</VCardSubtitle>

          <template #append>
            <div class="mt-n7 me-n3">
              <MoreBtn density="compact" />
            </div>
          </template>
        </VCardItem>

        <VCardText class="pt-12">
          <VList class="card-list mt-2">
            <VListItem v-for="transaction in lastThreeTransactions" :key="transaction.title">
              <template #prepend>
                <VAvatar :color="transaction.avatar.color" variant="tonal" rounded>
                  <VIcon :icon="transaction.avatar.icon" />
                </VAvatar>
              </template>

              <VListItemTitle class="font-weight-medium">
                {{ transaction.title }}
              </VListItemTitle>
              <VListItemSubtitle>
                <div class="text-body-1">
                  {{ transaction.subtitle }}
                </div>
              </VListItemSubtitle>
            </VListItem>
          </VList>

          <VBtn block class="mt-4">
            View Report
          </VBtn>
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss">
$responsive-border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

@media screen and (min-width: 600px) {
  .responsive-border {
    border-inline-end: $responsive-border;
  }
}

@media screen and (max-width: 599px) {
  .responsive-border {
    border-block-end: $responsive-border;
  }
}
</style>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}
</style>
