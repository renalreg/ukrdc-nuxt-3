<template>
  <div>
    <div class="mb-4 flex flex-col gap-2 lg:flex-row">
      <BaseDateRange v-model="dateRange" class="flex-1" />
      <UButton
        class="flex-shrink"
        size="sm"
        :label="orderAscending ? 'Oldest - Newest' : 'Newest - Oldest'"
        :icon="orderAscending ? 'i-heroicons-bars-arrow-up-20-solid' : 'i-heroicons-bars-arrow-down-20-solid'"
        @click="toggleOrder"
      />
    </div>

    <UCard :ui="{ body: { padding: '' } }">
      <!-- Skeleton results -->
      <ul v-if="!messages" class="divide-y divide-gray-300">
        <BaseSkeleListItem v-for="n in 10" :key="n" />
      </ul>
      <!-- Real results -->
      <ul v-else class="divide-y divide-gray-300">
        <li v-for="item in messages" :key="item.id" :item="item" class="hover:bg-gray-50">
          <NuxtLink :to="`/messages/${item.id}`">
            <MessagesListItem :show-patient-filter="false" :item="item" />
          </NuxtLink>
        </li>
      </ul>

      <template #footer>
        <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts">
import {
  type MasterRecordSchema,
  type MasterRecordStatisticsSchema,
  type MessageSchema,
  OrderBy,
} from "@ukkidney/ukrdc-axios-ts";

import BaseDateRange from "~/components/base/BaseDateRange.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import MessagesListItem from "~/components/messages/MessagesListItem.vue";
import useDateRange from "~/composables/query/useDateRange";
import usePagination from "~/composables/query/usePagination";
import useSortBy from "~/composables/query/useSortBy";
import useApi from "~/composables/useApi";
import { nowString } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BasePaginator,
    BaseDateRange,
    MessagesListItem,
  },
  props: {
    record: {
      type: Object as () => MasterRecordSchema,
      required: true,
    },
    stats: {
      type: Object as () => MasterRecordStatisticsSchema,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const { page, total, size } = usePagination();
    const { makeDateRange } = useDateRange();
    const { orderAscending, orderBy, toggleOrder } = useSortBy();
    const { masterRecordsApi } = useApi();

    // Set initial date dateRange
    const dateRange = makeDateRange(nowString(-365), nowString(0), true);

    // Data refs
    const messages = ref<MessageSchema[]>();

    // Data fetching

    function fetchMessages() {
      masterRecordsApi
        .getMasterRecordMessages({
          recordId: props.record.id,
          page: page.value ?? 1,
          size: size.value,
          orderBy: orderBy.value as OrderBy,
          since: dateRange.value.start,
          until: dateRange.value.end,
        })
        .then((response) => {
          messages.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        });
    }

    onMounted(() => {
      fetchMessages();
    });

    watch([page, orderBy, dateRange], () => {
      fetchMessages();
    });

    return {
      page,
      total,
      size,
      dateRange,
      messages,
      orderAscending,
      orderBy,
      toggleOrder,
    };
  },
});
</script>
