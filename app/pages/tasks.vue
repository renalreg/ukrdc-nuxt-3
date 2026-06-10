<template>
  <div>
    <h1 class="mb-4">Background Tasks</h1>

    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :data="tasks" :columns="columns" :ui="ui">
        <template #visibility-cell="{ row }">
          <BadgePublicPrivate :visibility="row.original.visibility" />
        </template>
        <template #started-cell="{ row }">
          <span>
            {{ row.original.started ? formatDate(row.original.started) : "Unknown start time" }}
          </span>
        </template>
        <template #finished-cell="{ row }">
          <span>
            {{ row.original.finished ? formatDate(row.original.finished) : "" }}
          </span>
        </template>
        <template #status-cell="{ row }">
          <span class="flex gap-1">
            <BadgeTaskStatus :status="row.original.status" />
            <BaseInfoTooltip v-if="row.original.error" class="inline">
              <p><b>Task failed with error: </b>{{ row.original.error }}</p>
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
        accessorKey: "name",
        header: "Name",
      },
      {
        id: "visibility",
        accessorKey: "visibility",
        header: "Visibility",
      },
      {
        id: "owner",
        accessorKey: "owner",
        header: "Started by",
      },
      {
        id: "started",
        accessorKey: "started",
        header: "Started",
      },
      {
        id: "finished",
        accessorKey: "finished",
        header: "Finished",
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
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
