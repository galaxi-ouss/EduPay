<script setup lang="ts">
import { DtoNewPayment, PAYMENT_TYPE } from '@/@core/types';
import { usePaymentStore } from '@/store/usePaymentStore';
import pdf from '@jbtje/vite-vue3pdf';

// import VuePdfApp from "vue3-pdf-app";
// import "vue3-pdf-app/dist/icons/main.css";

import { VForm } from "vuetify/components/VForm";

const refForm = ref<VForm>();



interface Props {
  studentCode?: string
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
  (e: 'onSubmit', val: number): number
}

const paymentStore = usePaymentStore();
const { addOne } = paymentStore
const route = useRoute()
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const newPayment = ref<DtoNewPayment>({
  studentCode: !route.params.code ? props.studentCode : route.params.code,
  amount: 0,
  date: new Date(),
  paymentType: PAYMENT_TYPE.CASH
})

interface FileData {
  file: File
  url: string
}

const fileData = ref<FileData[]>([])
const file = ref([])
const blob = ref(null)

const currentPage = ref(0)
const pageCount = ref(0)

const selectFile = (e) => {
  fileData.value[0] = {
    file: file.value[0],
    url: useObjectUrl(file.value[0]).value ?? '',
  }
  blob.value = fileData.value[0].url
}

const paymentTypeItems = [PAYMENT_TYPE.TRANSFER, PAYMENT_TYPE.CHECK, PAYMENT_TYPE.DEPOSIT, PAYMENT_TYPE.CASH]

const onFormSubmit = async () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      newPayment.value.amount = Number(newPayment.value.amount)
      console.table(newPayment.value);

      addOne(newPayment.value, file.value[0]).then(statusCode => {
        emit('onSubmit', statusCode);
        dialogModelValueUpdate(false)
      })
    }
  }).then(() => {
    blob.value = null
    onFormReset()
  })

}

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const onFormReset = () => {
  newPayment.value = {
    studentCode: !route.params.code ? props.studentCode : route.params.code,
    amount: 0,
    date: new Date(),
    paymentType: PAYMENT_TYPE.CASH
  }
  file.value = []
  dialogModelValueUpdate(false)

}


</script>

<template>
  <VDialog persistent :width="$vuetify.display.smAndDown ? 'auto' : 900" :model-value="props.isDialogVisible" @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          Add New Payment
        </h4>
        <p class="text-body-1 text-center mb-6">
          Updating user details will receive a privacy audit.
        </p>

        <!-- 👉 Form -->
        <VForm ref="refForm" class="mt-6" @submit.prevent="onFormSubmit">
          <VRow>
            <!-- 👉 Student Code -->
            <VCol cols="12" md="6">
              <AppTextField :rules="[requiredValidator]" v-model="newPayment.studentCode" label="Student Code" :disabled="props.studentCode ? true : false" />
            </VCol>

            <!-- 👉 Amount -->
            <VCol cols="12" md="6">
              <AppTextField :rules="[requiredValidator]" v-model="newPayment.amount" type="number" label="Amount" placeholder="Enter Amount" />
            </VCol>

            <!-- 👉 Payment Type -->
            <VCol cols="12" md="6">
              <AppSelect :rules="[requiredValidator]" v-model="newPayment.paymentType" label="Type" placeholder="Enter Type" :items="paymentTypeItems" />
            </VCol>

            <!-- 👉 Payment Date -->
            <VCol cols="12" md="6">
              <AppDateTimePicker :rules="[requiredValidator]" v-model="newPayment.date" label="Date" placeholder="Select date of your payment" />
            </VCol>

            <!-- 👉 Receipt -->
            <VCol cols="12" md="12">
              <VFileInput label="Receipt" :rules="[requiredValidator,fileValidator]" v-model="file" @change="selectFile" accept=".pdf" placeholder="Upload your receipt" />
            </VCol>

            <VCol cols="12" md="12">
              <pdf v-if="blob" :src="blob" @num-pages="pageCount = $event" @page-loaded="currentPage = $event"></pdf>
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" color="success" variant="outlined">
                Add Payment
              </VBtn>

              <VBtn color="error" variant="tonal" @click="onFormReset">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
