<template>
  <div>
    <div class="mx-auto mb-4 max-w-7xl">
      <h1>Records with Open Work Items</h1>
      <h3 class="mb-1">Quickly identifies Master Records with the largest number of open Work Items.</h3>
      <p>
        Note that this does not attempt to group Master Records by their link records.
        <br />
        For example, both the UKRDC and NHS Master Records for a patient will appear here separately.
      </p>
    </div>

    <!-- If loading -->
    <div v-if="fetchInProgress">
      <UCard :ui="{ body: { padding: '' } }">
        <!-- Skeleton results -->
        <ul class="divide-y divide-gray-300">
          <BaseSkeleListItem v-for="n in 10" :key="n" />
        </ul>
      </UCard>
    </div>
    <div v-else>
      <UCard :ui="{ body: { padding: '' } }">
        <!-- Real results -->
        <ul class="divide-y divide-gray-300">
          <li v-for="group in groups" :key="`group-${group.masterRecord.id}`" class="hover:bg-gray-50">
            <NuxtLink :to="`/masterrecords/${group.masterRecord.id}/issues`">
              <MasterRecordsListItem
                :item="group.masterRecord"
                details-label="Open Work Items"
                :details-value="group.workItemCount.toString()"
              />
            </NuxtLink>
          </li>
        </ul>

        <template #footer>
          <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
        </template>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts">
import { type WorkItemGroup } from "@ukkidney/ukrdc-axios-ts";

import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import MasterRecordsListItem from "~/components/MasterRecordsListItem.vue";
import usePagination from "~/composables/query/usePagination";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BasePaginator,
    MasterRecordsListItem,
  },
  setup() {
    const { page, total, size } = usePagination();
    const { adminApi } = useApi();

    // Data refs
    size.value = 10; // Get 10 groups as we expect a couple of records per group

    const groups = ref<WorkItemGroup[]>();
    const fetchInProgress = ref(false);

    const lastRunTime = ref<string>();

    // Data fetching
    function getGroups() {
      fetchInProgress.value = true;

      adminApi
        .getRecordWorkitemCounts({
          page: page.value ?? 1,
          size: size.value,
        })
        .then((response) => {
          groups.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        })
        .finally(() => {
          fetchInProgress.value = false;
        });
    }

    onMounted(() => {
      getGroups();
    });

    watch(page, () => {
      getGroups();
    });

    return {
      groups,
      fetchInProgress,
      lastRunTime,
      page,
      total,
      size,
      formatDate,
    };
  },
});
</script>
