<template>
  <VDataTableServer v-model:items-per-page="itemsPerPage" v-model:page="page" :headers="headers" :items="data || []" :items-length="totalData" class="text-no-wrap" @update:options="updateOptions">
    <!-- Dynamic Item Templates -->
    <template v-for="header in headers" :key="header.key" #[`item.${header.key}`]="{ item }">
      <span v-if="header.format">
        <!-- Render formatted content if format function is provided -->
        <span :class="header.key === 'amount' && 'font-weight-black' ">{{ header.format(item) }}</span>
      </span>
      <VChip small v-else-if="header.key === 'type'" :color="resolvePaymentType(item.type)?.color" label size="small">
        {{ resolvePaymentType(item.type)?.text }}
      </VChip>
      <VChip v-else-if="header.key === 'status'" :color="resolvePaymentStatus(item.status)?.color" label size="small">
        {{ resolvePaymentStatus(item.status).text }}
      </VChip>
      <VChip v-else-if="header.key === 'programId'" :color="resolveProgram(item.programId)?.color" label size="small">
        {{ resolveProgram(item.programId).text }}
      </VChip>
      <div v-else-if="header.key === 'actions'">
        <IconBtn v-for="(action, index) in actions" :key="index" @click="() => action.handler(item)">
          <VIcon :color="action?.color || 'secondary'" :size="action.size || 23" :icon="action.icon" />
          <VTooltip activator="parent" top>{{ action?.icon == 'tabler-eye' ? 'View details' : action?.icon==='tabler-edit' ? " Edit Infos ": "Delete Student"  }}</VTooltip>
        </IconBtn>
      </div>
      <div v-else-if="header.key==='receipt'">
        <VBtn variant="outlined" color="info" prepend-icon="tabler-stereo-glasses" size="small" @click="viewPDF(item)">
          Pdf
        </VBtn>
      </div>
      <div v-else-if="header.key==='account'">
        <VSwitch v-model="item.accountActive" @change="$emit('toggleAccount',item)" />
      </div>
      <div v-else-if="header.key==='seen'">
        <VSwitch v-model="item.seen" @change="$emit('toggleRead',item)" />
      </div>
      <span v-else>
        <!-- Render plain text for other headers -->
        {{ item[header.key] }}
      </span>
    </template>

    <!-- Pagination Controls -->
    <template #bottom>
      <VCardText class="pt-5">
        <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
          <VSelect v-model="itemsPerPage" :items="[5, 10, 50, 100]" style="max-inline-size: 8rem; min-inline-size: 5rem; font-size: 95px;" label="Rows par page :" variant="filled" />

          <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="totalData" />
        </div>
      </VCardText>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { PAYMENT_STATUS, PAYMENT_TYPE, PROGRAM } from '@/@core/types';
// Props
const props = defineProps({
  headers: Array,
  data: Array,
  totalData: Number,
  itemsPerPage: Number,
  page: Number,
  actions: Array,
  accountActive: Boolean
});

const { headers, data, totalData, actions } = toRefs(props);


// Emits
const emit = defineEmits(['edit-status', 'update:itemsPerPage', 'update:page', 'viewPDF', 'toggleAccount', 'toggleRead']);
const resolvePaymentStatus = (status: string) => {
  if (status === PAYMENT_STATUS.CREATED)
    return { text: PAYMENT_STATUS.CREATED, color: 'primary' }
  if (status === PAYMENT_STATUS.VALIDATED)
    return { text: PAYMENT_STATUS.VALIDATED, color: 'success' }
  return { text: PAYMENT_STATUS.REJECTED, color: 'error' }
}

const resolvePaymentType = (type: string) => {
  if (type === PAYMENT_TYPE.CASH)
    return { text: PAYMENT_TYPE.CASH, color: 'success' }
  if (type === PAYMENT_TYPE.CHECK)
    return { text: PAYMENT_TYPE.CHECK, color: 'primary' }
  if (type === PAYMENT_TYPE.DEPOSIT)
    return { text: PAYMENT_TYPE.DEPOSIT, color: 'info' }

  return { text: PAYMENT_TYPE.TRANSFER, color: 'warning' }
}

const resolveProgram = (type: string) => {
  if (type === PROGRAM.SMA)
    return { text: PROGRAM.SMA, color: 'success' }
  if (type === PROGRAM.SMC)
    return { text: PROGRAM.SMC, color: 'primary' }
  if (type === PROGRAM.SMI)
    return { text: PROGRAM.SMI, color: 'info' }
  if (type === PROGRAM.SMP)
    return { text: PROGRAM.SMP, color: 'secondary' }
  return { text: PROGRAM.SVT, color: 'warning' }
}


// Local State
const itemsPerPage = ref(10);
const page = ref(1);

// Watchers to sync props with local state
watch(() => props.itemsPerPage, (newVal) => emit('update:itemsPerPage', newVal));
watch(() => props.page, (newVal) => emit('update:page', newVal));
// watch(() => props.totalData, (newVal) => emit('update:totalData', newVal));
// Methods
const updateOptions = (options) => {
  emit('update:itemsPerPage', options.itemsPerPage);
  emit('update:page', options.page);
};

const viewPDF = (val) => emit('viewPDF', val)


</script>

<style scoped lang="scss">
.customer-title:hover {
  color: rgba(var(--v-theme-primary)) !important;
}

.product-widget {
  border-block-end: 1px solid
    rgba(var(--v-theme-on-surface), var(--v-border-opacity));
  padding-block-end: 1rem;
}

::v-deep(.v-table .v-table__wrapper > table > tbody > tr > td) {
  font-size: 12px;
}

::v-deep(.v-data-table-header__content) {
  font-weight: bold !important;
}

::v-deep(.v-table > .v-table__wrapper > table) {
  padding: 0 30px;
}
</style>
