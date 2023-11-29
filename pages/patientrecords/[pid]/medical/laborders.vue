<template>
  <div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable
        :loading="loading"
        :rows="orders"
        :columns="columns"
        class="sensitive"
        @select="
          $router.push({ path: `/patientrecords/${$event.pid}/medical/results`, query: { order_id: $event.id } })
        "
      >
        <!-- specimenCollectedTime -->
        <template #specimenCollectedTime-data="{ row }">
          {{
            row.specimenCollectedTime
              ? `Collected ${formatDate(row.specimenCollectedTime, true)}`
              : "No collection time found"
          }}
        </template>
      </UTable>
      <template #footer>
        <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type LabOrderShortSchema, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BasePaginator from "~/components/base/BasePaginator.vue";
import usePagination from "~/composables/query/usePagination";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BasePaginator,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },

  setup(props) {
    const { page, total, size } = usePagination();
    const { patientRecordsApi } = useApi();

    // Data refs
    size.value = 18; // Fetch a multiple of our row length
    const orders = ref([] as LabOrderShortSchema[]);

    // Data fetching
    const loading = ref(false);
    function fetchOrders() {
      loading.value = true;
      patientRecordsApi
        .getPatientLaborders({
          pid: props.record.pid,
          page: page.value || 1,
          size: size.value,
        })
        .then((response) => {
          orders.value = response.data.items;
          total.value = response.data.total;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    onMounted(() => {
      fetchOrders();
    });

    watch(page, () => {
      fetchOrders();
    });

    const columns = [
      {
        key: "id",
        label: "Order ID",
      },
      {
        key: "specimenCollectedTime",
        label: "Collection Time",
      },
    ];

    return { page, size, total, loading, orders, columns, formatDate };
  },
});
</script>
