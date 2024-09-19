<script setup lang="ts">
import { useNotificationStore } from '@/store/useNotificationStore';
import { useStatisticsStore } from '@/store/useStatisticsStore';
import type { ChartJsCustomColors } from '@/views/charts/chartjs/types';
import { getLatestBarChartConfig, getPolarChartConfig } from '@core/libs/chartjs/chartjsConfig';
import BarChart from '@core/libs/chartjs/components/BarChart';
import PolarAreaChart from '@core/libs/chartjs/components/PolarAreaChart';
import { ref } from 'vue';
import { useTheme } from 'vuetify';

// Get the statistics store
const notificationStore = useNotificationStore();
const { onLoginNotifications, peagableNotifications } = notificationStore;
const statisticsStore = useStatisticsStore();
const { statisticsBarCharData, statisticsPolarAreaCharData, error, loading } = storeToRefs(statisticsStore);
const { onLoginFetchData } = statisticsStore
const vuetifyTheme = useTheme()

const chartOptions = computed(() => getLatestBarChartConfig(vuetifyTheme.current.value))

const chartConfig = computed(() => getPolarChartConfig(vuetifyTheme.current.value))

// Define custom colors for the chart
const chartJsCustomColors: ChartJsCustomColors = {
  white: '#fff',
  yellow: '#ffe802',
  primary: '#836af9',
  areaChartBlue: '#2c9aff',
  barChartYellow: '#ffcf5c',
  polarChartGrey: '#4f5d70',
  polarChartInfo: '#299aff',
  lineChartYellow: '#d4e157',
  polarChartGreen: '#28dac6',
  lineChartPrimary: '#9e69fd',
  lineChartWarning: '#ff9800',
  horizontalBarInfo: '#26c6da',
  polarChartWarning: '#ff8131',
  scatterChartGreen: '#28c76f',
  warningShade: '#ffbd1f',
  areaChartBlueLight: '#84d0ff',
  areaChartGreyLight: '#edf1f4',
  scatterChartWarning: '#ff9f43',
}

// Define selectedOption and items for the month selection
const selectedOption = ref<{ title: string; pos: number }>({ title: 'Jan', pos: 1 });

const items = [
  { title: 'Jan', pos: 1 },
  { title: 'Feb', pos: 2 },
  { title: 'Mar', pos: 3 },
  { title: 'Apr', pos: 4 },
  { title: 'May', pos: 5 },
  { title: 'Jun', pos: 6 },
  { title: 'Jul', pos: 7 },
  { title: 'Aug', pos: 8 },
  { title: 'Sep', pos: 9 },
  { title: 'Oct', pos: 10 },
  { title: 'Nov', pos: 11 },
  { title: 'Dec', pos: 12 },
];

watch(selectedOption, async (val) => {
  if (val == null) {
    await onLoginFetchData();
  } else {
    await onLoginFetchData(val.pos);
  }

});


// function sendMessage() {
//   WebSocketService.send('/app/myEndpoint', { content: 'Hello, WebSocket!' });
// }

onMounted(async () => {
  onLoginFetchData().then(() => {
    console.log(notificationStore.notificationsList);

  })
})


</script>

<template>
  <!-- Latest Statistics -->
  <VRow class="match-height">
    <VCol cols="12" md="6">
      <VCard>
        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
          <VCardTitle>Statistics by month</VCardTitle>

          <template #append>
            <div>
              <AppCombobox v-model="selectedOption" :items="items" item-title="title" item-value="pos" label="Filter by month" placeholder="all" return-object clearable :class="$vuetify.display.width ? '1000' : '900'" />
            </div>
          </template>
        </VCardItem>

        <VCardText v-if="statisticsBarCharData">

          <BarChart :height="400" :chart-data="statisticsBarCharData" :chart-options="chartOptions" />
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="6">
      <VCard title="Statistics by program">
        <VCardText v-if="statisticsPolarAreaCharData">
          <PolarAreaChart :height="400" :chart-data="statisticsPolarAreaCharData" :chart-options="chartConfig" />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
</style>
