<template>
  <div>
    <h1 class="mb-4">Background Tasks</h1>

    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :rows="tasks" :columns="columns" :ui="ui">
        <template #visibility-data="{ row }">
          <BadgePublicPrivate :visibility="row.visibility" />
        </template>
        <template #started-data="{ row }">
          <span>
            {{ row.started ? formatDate(row.started) : "Unknown start time" }}
          </span>
        </template>
        <template #finished-data="{ row }">
          <span>
            {{ row.finished ? formatDate(row.finished) : "" }}
          </span>
        </template>
        <template #status-data="{ row }">
          <span class="flex gap-1">
            <BadgeTaskStatus :status="row.status" />
            <BaseInfoTooltip v-if="row.error" class="inline">
              <p><b>Task failed with error: </b>{{ row.error }}</p>
            </BaseInfoTooltip>
          </span>
        </template>
      </UTable>
      <template #footer>
        <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts">
import type { TrackableTaskSchema } from "@ukkidney/ukrdc-axios-ts";

import BadgePublicPrivate from "~/components/BadgePublicPrivate.vue";
import BadgeTaskStatus from "~/components/BadgeTaskStatus.vue";
import BaseInfoTooltip from "~/components/base/BaseInfoTooltip.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import usePagination from "~/composables/query/usePagination";
import useTasks from "~/composables/useTasks";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BasePaginator,
    BaseInfoTooltip,
    BadgePublicPrivate,
    BadgeTaskStatus,
  },
  setup() {
    const { page, total, size } = usePagination();
    const { fetchTasksList } = useTasks();

    // Data refs
    const tasks = ref([] as TrackableTaskSchema[]);

    // Data fetching
    onMounted(() => {
      fetchTasksList(page.value ?? 1, size.value)
        .then((response) => {
          tasks.value = response.items;
          total.value = response.total ?? 0;
          page.value = response.page ?? 0;
          size.value = response.size ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });
    const ui = {
      th: {
        base: "px-6 py-3",
      },
      td: {
        base: "px-6 py-3 whitespace-nowrap",
      },
    };

    const columns = [
      {
        id: "name",
        key: "name",
        label: "Name",
      },
      {
        id: "visibility",
        key: "visibility",
        label: "Visibility",
      },
      {
        id: "owner",
        key: "owner",
        label: "Started by",
      },
      {
        id: "started",
        key: "started",
        label: "Started",
      },
      {
        id: "finished",
        key: "finished",
        label: "Finished",
      },
      {
        id: "status",
        key: "status",
        label: "Status",
      },
    ];

    return {
      formatDate,
      page,
      total,
      size,
      tasks,
      columns,
      ui,
    };
  },
  head: {
    title: "Background Tasks",
  },
});
</script>
