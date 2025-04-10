<script setup>
import { hexToRgb } from '@core/utils/colorConverter'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

cons

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
      categories: [
        2018,
        2019,
        2020,
        2021,
        2022,
        2023,
        2024,
      ],
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
          <VueApexCharts type="bar" :options="options" :series="series" :height="292" />
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
