<script setup lang="ts">
import { Payment, PAYMENT_STATUS, PAYMENT_TYPE } from '@/@core/types';
import { useNotificationStore } from '@/store/useNotificationStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { toast } from 'vue3-toastify';



const notificationStore = useNotificationStore()
const { notificationsFromPagination, error, loading } = storeToRefs(notificationStore)
const { pageableNotifications } = notificationStore

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()



const notifications = computed(() => notificationsFromPagination.value?.content)
const totalNotifications = computed(() => notificationsFromPagination.value?.totalElements)


const options = ref({ page: 1, itemsPerPage: 5, sortBy: [''], sortDesc: [false] })
const isAddPayementDialogVisible = ref(false);
const isEditStatusDialogVisible = ref(false)
const editPayment = ref<Payment>(null)
const editStatus = (item: Payment) => {
  editPayment.value = item
  isEditStatusDialogVisible.value = true
}

const viewDetails = (item) => {
  console.log(item);

}

const clearFilters = () => {
  selectedSeen.value = ''

}


const selectedSeen = ref('')


watch([selectedSeen], (newValue) => {
  page.value = 1;
  pageableNotifications(page.value, itemsPerPage.value, newValue[0]);

})

const changeSize = (val) => {
  itemsPerPage.value = val
}

const changePage = (val) => {
  page.value = val
}

watch(itemsPerPage, (newVal) => {
  pageableNotifications(page.value, itemsPerPage.value)

});
watch(page, (newPage) => {
  pageableNotifications(page.value, itemsPerPage.value)
});

onMounted(async () => {
  await pageableNotifications(page.value, itemsPerPage.value)

})

const isSeenItems = ref([
  { title: "seen", value: true },
  { title: "unseen", value: false },
])

const toggle = (item) => {
  console.log(item);

}

</script>

<template>

  <VCard>
    <VCardTitle class="pa-9 text-h3">
      Payments List
    </VCardTitle>
    <!-- 👉 Filters -->
    <VCardText>
      <VRow>
        <!-- 👉 Select Seen -->
        <VCol cols="12" md="2" sm="4">
          <AppSelect v-model="selectedSeen" label="Filter" placeholder="Is Seen" :items="isSeenItems" clearable clear-icon="tabler-x" />
        </VCol>

        <!-- 👉 Select Stock Status -->
        <!-- <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStock"
              placeholder="Stock"
              :items="stockStatus"
              clearable
              clear-icon="tabler-x"
            />
          </VCol> -->
      </VRow>
    </VCardText>

    <VDivider />
    <!-- 👉 Payments Table -->
    <div v-if="loading" class="p-5">
      <VSkeletonLoader v-for="i in 8" :key="i" type="table-row-divider" />
    </div>
    <div v-else>
      <div v-if="error">
        <Alert title="Error" text="Error of The server" type="error" />
      </div>
      <div v-else>
        <div v-if="notifications && notifications?.length >0">

          <VDivider />

          <AppDataTableServer v-if="notifications" @update:page="changePage" @update:items-per-page="changeSize" :headers="[
              {
                key: 'notificationId',
                title: 'Notification Id',
              },
              {
                key: 'registerDate',
                title: 'Register date',
                format: (item) => new Date(item.registerDate).toDateString()
              },
              
              {
                key: 'message',
                title: 'Message',
              },

              {
                key: 'seen',
                title: 'Is Seen',
              },
              {
                key: 'actions',
                title : 'Actions'
              }
            ]" @toggle-read="toggle" :data="notifications" :totalData="totalNotifications" :actions="[
              { icon: 'tabler-edit', handler: (item) => editStatus(item) },
            ]" />

        </div>
        <div v-else>
          <Alert title="Info" text="No Payment Available" type="info" />
        </div>
      </div>
    </div>
  </VCard>

  <EditStatusPaymentDrawer v-if="editPayment" :edit-payment="editPayment" v-model:isDrawerOpen="isEditStatusDialogVisible" @on-update="updateStatus" />
  <AddPaymentDialog v-model:is-dialog-visible="isAddPayementDialogVisible" @onSubmit="afterSubmit" />

</template>

<style lang="scss" scoped>
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
