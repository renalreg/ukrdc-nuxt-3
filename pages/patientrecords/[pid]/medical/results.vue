<template>
  <div class="sensitive">
    <BaseModalConfirm
      ref="deleteResultAlert"
      title="Delete Result Item"
      message="Are you sure you want to delete this result item?"
      icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      :danger="true"
      @confirm="deleteResultItem"
      @cancel="cancelDeleteResultItem"
    />

    <BaseModalConfirm
      ref="deleteOrderAlert"
      title="Delete Lab Order"
      message="Are you sure you want to delete this lab order and all associated result items?"
      icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      :danger="true"
      @confirm="deleteLabOrder"
    />

    <BaseLoadingContainer :loading="!results">
      <BaseDateRange v-model="dateRange" class="mb-4" />

      <!-- Code select -->
      <div class="mb-4 flex">
        <USelectMenu
          v-model="selectedService"
          searchable
          class="flex-1"
          size="lg"
          :options="availableServices"
          value-attribute="id"
          option-attribute="description"
          :search-attributes="['description', 'id']"
          placeholder="Select a result type"
        />
        <UButton class="ml-2" size="lg" label="Clear" @click="selectedService = undefined" />
      </div>

      <div>
        <div class="mb-4 flex flex-grow items-center gap-2">
          <NuxtLink :to="'./laborders'">
            <UButton>View Lab Orders</UButton>
          </NuxtLink>
          <NuxtLink v-if="selectedOrderId" :to="{ query: { order_id: null } }">
            <UButton>Show Results From All Lab Orders</UButton>
          </NuxtLink>
          <UButton
            v-if="selectedOrderId && selectedOrder"
            color="red"
            variant="outline"
            @click="deleteOrderAlert?.show()"
            >Delete Lab Order</UButton
          >
        </div>

        <UCard :ui="{ body: { padding: '' } }" class="mb-4">
          <UTable :loading="loading" :rows="results" :columns="columns" class="sensitive">
            <!-- Value -->
            <template #value-data="{ row }"> {{ row.value }} {{ row.valueUnits }} </template>
            <!-- observationTime -->
            <template #observationTime-data="{ row }">
              {{ row.observationTime ? formatDate(row.observationTime) : "No observation time" }}
            </template>
            <!-- prePost -->
            <template #prePost-data="{ row }">
              <BadgePrePost v-if="row.prePost" :pre-post="row.prePost" />
            </template>
            <template #actions-data="{ row }">
              <UDropdown :items="menuItems(row)">
                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
              </UDropdown>
            </template>
          </UTable>
          <template #footer>
            <BasePaginator
              :page="page"
              :size="size"
              :total="total"
              @next="page++"
              @prev="page--"
              @jump="page = $event"
            />
          </template>
        </UCard>
      </div>
    </BaseLoadingContainer>
  </div>
</template>

<script lang="ts">
import {
  type LabOrderSchema,
  type PatientRecordSchema,
  type ResultItemSchema,
  type ResultItemServiceSchema,
} from "@ukkidney/ukrdc-axios-ts";

import BadgePrePost from "~/components/BadgePrePost.vue";
import BaseDateRange from "~/components/base/BaseDateRange.vue";
import BaseLoadingContainer from "~/components/base/BaseLoadingContainer.vue";
import BaseModalConfirm from "~/components/base/BaseModalConfirm.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import useDateRange from "~/composables/query/useDateRange";
import usePagination from "~/composables/query/usePagination";
import useQuery from "~/composables/query/useQuery";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";
import { type ModalInterface } from "~/interfaces/modal";

export default defineComponent({
  components: {
    BaseLoadingContainer,
    BasePaginator,
    BaseDateRange,
    BaseModalConfirm,
    BadgePrePost,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },
  setup(props) {
    const toast = useToast();
    const { page, total, size } = usePagination();
    const { makeDateRange } = useDateRange();
    const { stringQuery } = useQuery();
    const { patientRecordsApi } = useApi();

    // Set initial date dateRange
    const dateRange = makeDateRange(null, null, true, false);

    // Data refs

    const results = ref<ResultItemSchema[]>();

    // Data fetching

    const loading = ref(false);

    function fetchResults() {
      loading.value = true;
      patientRecordsApi
        .getPatientResults({
          pid: props.record.pid,
          page: page.value ?? 1,
          size: size.value,
          serviceId: selectedService.value ? [selectedService.value] : undefined,
          orderId: selectedOrderId.value ? [selectedOrderId.value] : undefined,
          since: dateRange.value.start ?? undefined,
          until: dateRange.value.end ?? undefined,
        })
        .then((response) => {
          results.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        })
        .finally(() => {
          loading.value = false;
        });

      // If we don't already have a list of available codes, fetch one
      if (availableServices.value.length === 0) {
        patientRecordsApi
          .getPatientResultServices({
            pid: props.record.pid,
          })
          .then((response) => {
            availableServices.value = response.data;
          });
      }
    }

    const selectedOrder = ref<LabOrderSchema>();

    function fetchLabOrder() {
      if (selectedOrderId.value) {
        patientRecordsApi
          .getPatientLaborder({
            pid: props.record.pid,
            orderId: selectedOrderId.value,
          })
          .then((response) => {
            selectedOrder.value = response.data;
          });
      }
    }

    // Data deletion

    const deleteResultAlert = ref<ModalInterface>();
    const deleteOrderAlert = ref<ModalInterface>();

    const itemToDelete = ref<ResultItemSchema | null>(null);

    function showDeleteResultItemModal(item: ResultItemSchema) {
      itemToDelete.value = item;
      deleteResultAlert.value?.show();
    }

    function cancelDeleteResultItem() {
      itemToDelete.value = null;
      deleteResultAlert.value?.hide();
    }

    function deleteResultItem() {
      if (itemToDelete.value) {
        patientRecordsApi
          .deletePatientResultDelete({
            pid: props.record.pid,
            resultitemId: itemToDelete.value.id,
          })
          .then(() => {
            toast.add({
              title: "Success",
              description: "Result Item deleted",
            });
            fetchResults();
            itemToDelete.value = null;
            deleteResultAlert.value?.hide();
          });
      }
    }

    function deleteLabOrder() {
      if (selectedOrder.value) {
        patientRecordsApi
          .deletePatientLaborderDelete({
            pid: props.record.pid,
            orderId: selectedOrder.value.id,
          })
          .then(() => {
            toast.add({
              title: "Success",
              description: "Lab Order deleted",
            });
            selectedOrderId.value = null;
            fetchResults();
            fetchLabOrder();
            deleteOrderAlert.value?.hide();
          });
      }
    }

    // Result item services

    const availableServices = ref([] as ResultItemServiceSchema[]);
    const selectedService = stringQuery("service_id", null, true, true);

    // Lab order filter

    const selectedOrderId = stringQuery("order_id", null, true, true);

    // Data lifecycle

    onMounted(() => {
      fetchResults();
      fetchLabOrder();
    });

    watch(
      [
        page,
        selectedService,
        selectedOrderId,
        () => JSON.stringify(dateRange.value), // Stringify to watch for actual value changes
      ],
      () => {
        fetchResults();
      },
    );

    watch(selectedOrderId, () => {
      fetchLabOrder();
    });

    const columns = [
      {
        key: "serviceId",
        label: "Type",
      },
      {
        key: "value",
        label: "Value",
      },
      {
        key: "orderId",
        label: "Order ID",
      },
      {
        key: "observationTime",
        label: "Observation time",
      },
      {
        key: "prePost",
      },
      {
        key: "actions",
      },
    ];

    const menuItems = (row: ResultItemSchema) => [
      [
        {
          label: "Filter by this lab order",
          icon: "i-heroicons-funnel-20-solid",
          to: { query: { order_id: row.orderId } },
        },
        {
          label: "Delete this result item",
          icon: "i-heroicons-trash-20-solid",
          click: () => showDeleteResultItemModal(row),
        },
      ],
    ];

    return {
      page,
      size,
      total,
      dateRange,
      loading,
      results,
      columns,
      menuItems,
      deleteResultAlert,
      deleteOrderAlert,
      itemToDelete,
      showDeleteResultItemModal,
      cancelDeleteResultItem,
      deleteResultItem,
      deleteLabOrder,
      availableServices,
      selectedService,
      selectedOrderId,
      selectedOrder,
      formatDate,
    };
  },
});
</script>

<style scoped lang="postcss">
th {
  @apply px-6 py-3;
}
</style>
