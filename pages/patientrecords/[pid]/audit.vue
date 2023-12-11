<template>
  <div>
    <div class="mb-4 flex flex-col">
      <div class="mb-4 flex flex-row gap-2">
        <BaseDateRange v-model="dateRange" class="flex-1" />
        <UButton
          class="flex-shrink"
          :icon="orderAscending ? 'i-heroicons-bars-arrow-up-20-solid' : 'i-heroicons-bars-arrow-down-20-solid'"
          :label="orderAscending ? 'Oldest - Newest' : 'Newest - Oldest'"
          size="sm"
          @click="toggleOrder"
        />
      </div>
      <div class="flex gap-4">
        <USelect
          v-model="selectedResource"
          :options="availableResources"
          placeholder="Select a resource type"
          class="w-64"
        />
        <USelect
          v-model="selectedOperation"
          :options="availableOperations"
          placeholder="Select an operation"
          class="w-64"
        />
        <UButton class="flex-shrink" label="Clear" size="sm" @click="clearSelection" />
      </div>
    </div>

    <UCard :ui="{ body: { padding: '' } }">
      <!-- Skeleton results -->
      <div v-if="auditFetchInProgress">
        <ul v-if="auditFetchInProgress" class="divide-y divide-gray-300">
          <BaseSkeleListItem v-for="n in 10" :key="n" />
        </ul>
      </div>
      <!-- Real results -->
      <div v-else>
        <ul class="divide-y divide-gray-300">
          <li v-for="item in events" :key="item.id">
            <AuditListItem :item="item" />
          </li>
        </ul>
      </div>

      <template #footer>
        <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type AuditEventSchema, AuditOperation, OrderBy, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";
import { Resource } from "@ukkidney/ukrdc-axios-ts/api";

import AuditListItem from "~/components/AuditListItem.vue";
import BaseDateRange from "~/components/base/BaseDateRange.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import useDateRange from "~/composables/query/useDateRange";
import usePagination from "~/composables/query/usePagination";
import useQuery from "~/composables/query/useQuery";
import useSortBy from "~/composables/query/useSortBy";
import useApi from "~/composables/useApi";
import { nowString } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BasePaginator,
    BaseDateRange,
    AuditListItem,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const { page, total, size } = usePagination();
    const { makeDateRange } = useDateRange();
    const { stringQuery } = useQuery();
    const { orderAscending, orderBy, toggleOrder } = useSortBy();
    const { patientRecordsApi } = useApi();

    // Set initial date dateRange
    const dateRange = makeDateRange(nowString(-30), nowString(0), true);

    // Data refs
    const events = ref<AuditEventSchema[]>();

    const availableResources: string[] = Object.values(Resource).sort();
    const selectedResource = stringQuery("resource", undefined, true, true);
    const availableOperations: string[] = Object.values(AuditOperation).sort();
    const selectedOperation = stringQuery("operation", undefined, true, true);

    function clearSelection() {
      router.replace({
        query: {
          selectedOperation: undefined,
          selectedResource: undefined,
        },
      });
    }

    // Data fetching

    const auditFetchInProgress = ref(false);

    function fetchEvents() {
      auditFetchInProgress.value = true;

      patientRecordsApi
        .getPatientAudit({
          pid: props.record.pid,
          page: page.value ?? 1,
          size: size.value,
          orderBy: orderBy.value as OrderBy,
          since: dateRange.value.start,
          until: dateRange.value.end,
          ...(selectedResource.value && { resource: selectedResource.value as Resource }),
          ...(selectedOperation.value && { operation: selectedOperation.value as AuditOperation }),
        })
        .then((response) => {
          events.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        })
        .finally(() => {
          auditFetchInProgress.value = false;
        });
    }

    onMounted(() => {
      fetchEvents();
    });

    watch([page, orderBy, selectedResource, selectedOperation, dateRange], () => {
      fetchEvents();
    });

    return {
      page,
      total,
      size,
      dateRange,
      events,
      orderAscending,
      orderBy,
      toggleOrder,
      clearSelection,
      availableResources,
      selectedResource,
      availableOperations,
      selectedOperation,
      auditFetchInProgress,
    };
  },
});
</script>
