<template>
  <div>
    <div class="mx-auto mb-4 max-w-7xl">
      <h1>Work Items</h1>
    </div>

    <div class="mb-4 flex flex-col">
      <BaseDateRange v-model="dateRange" class="mb-4" />
      <!-- Facility select -->
      <div v-if="facilities.length > 1" class="mb-4 flex">
        <USelectMenu
          v-model="selectedFacility"
          searchable
          class="flex-1"
          size="lg"
          :options="facilities"
          value-attribute="id"
          option-attribute="description"
          :search-attributes="['description', 'id']"
          placeholder="Select a sending facility"
        />
        <UButton class="ml-2" size="lg" label="Clear" @click="selectedFacility = undefined" />
      </div>
      <div class="flex items-center">
        <div class="flex-grow">
          <USelectMenu
            v-model="statuses"
            :options="workItemStatusTabs"
            multiple
            placeholder="Select status"
            option-attribute="name"
            value-attribute="value"
            class="w-48"
          />
        </div>
        <UButton
          class="flex-shrink"
          size="sm"
          :label="orderAscending ? 'Oldest - Newest' : 'Newest - Oldest'"
          :icon="orderAscending ? 'i-heroicons-bars-arrow-up-20-solid' : 'i-heroicons-bars-arrow-down-20-solid'"
          @click="toggleOrder"
        />
      </div>
    </div>

    <UCard :ui="{ body: { padding: '' } }">
      <!-- Skeleton results -->
      <div v-if="fetchInProgress">
        <ul class="divide-y divide-gray-300">
          <BaseSkeleListItem v-for="n in 10" :key="n" />
        </ul>
      </div>
      <!-- Real results -->
      <div v-else>
        <ul class="divide-y divide-gray-300">
          <li v-for="item in workitems" :key="item.id" :item="item" class="hover:bg-gray-50">
            <NuxtLink :to="`/workitems/${item.id}`">
              <WorkItemsListItem :item="item" />
            </NuxtLink>
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
import { OrderBy, type WorkItemSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseDateRange from "~/components/base/BaseDateRange.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import WorkItemsListItem from "~/components/workitem/WorkItemsListItem.vue";
import useDateRange from "~/composables/query/useDateRange";
import usePagination from "~/composables/query/usePagination";
import useQuery from "~/composables/query/useQuery";
import useSortBy from "~/composables/query/useSortBy";
import useApi from "~/composables/useApi";
import useFacilities from "~/composables/useFacilities";
import { workItemStatusTabs } from "~/helpers/workItemUtils";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BasePaginator,
    BaseDateRange,
    WorkItemsListItem,
  },
  setup() {
    const { page, total, size } = usePagination();
    const { makeDateRange } = useDateRange();
    const { arrayQuery } = useQuery();
    const { facilities, selectedFacility } = useFacilities();
    const { orderAscending, orderBy, toggleOrder } = useSortBy();
    const { workItemsApi } = useApi();

    // Data refs
    const workitems = ref<WorkItemSchema[]>();
    const statuses = arrayQuery("status", ["1"], true, true);

    const fetchInProgress = ref(false);

    // Set initial date dateRange
    const dateRange = makeDateRange(null, null, true, true);

    // Work tiem status tab
    const currentTab = ref<number>(1);

    // Data fetching

    function getWorkitems() {
      fetchInProgress.value = true;

      workItemsApi
        .getWorkitems({
          page: page.value || 1,
          size: size.value,
          orderBy: orderBy.value as OrderBy,
          status: statuses.value.filter((el) => !isNaN(Number(el))).map(Number),
          facility: selectedFacility.value || undefined,
          since: dateRange.value.start || undefined,
          until: dateRange.value.end || undefined,
        })
        .then((response) => {
          workitems.value = response.data.items;
          page.value = response.data.page ?? 0;
          total.value = response.data.total;
          size.value = response.data.size ?? 0;
        })
        .finally(() => {
          fetchInProgress.value = false;
        });
    }

    onMounted(() => {
      getWorkitems();
    });

    watch(
      [
        page,
        selectedFacility,
        orderBy,
        currentTab,
        () => JSON.stringify(dateRange.value), // Stringify to watch for actual value changes
        () => JSON.stringify(statuses.value), // Stringify to watch for actual value changes
      ],
      () => {
        getWorkitems();
      },
    );

    return {
      fetchInProgress,
      page,
      total,
      size,
      dateRange,
      workitems,
      statuses,
      facilities,
      selectedFacility,
      orderAscending,
      orderBy,
      toggleOrder,
      workItemStatusTabs,
      currentTab,
    };
  },
  head: {
    title: "Work Items",
  },
});
</script>

<style></style>
