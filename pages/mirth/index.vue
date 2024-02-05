<template>
  <div>
    <div class="mx-auto mb-4 max-w-7xl">
      <h1>Mirth Channels</h1>
    </div>

    <BaseLoadingIndicator v-if="!mirthGroups"></BaseLoadingIndicator>
    <div v-else class="mx-auto mb-8 max-w-7xl">
      <UCard :ui="{ body: { padding: '' } }">
        <UTable :rows="mirthChannels" :columns="columns">
          <!-- Name -->
          <template #name-data="{ row }">
            <UPopover v-if="row.description" mode="hover" class="h-5 w-5">
              {{ row.name }}
              <template #panel>
                <div class="p-3 text-xs">
                  <p>{{ row.description }}</p>
                </div>
              </template>
            </UPopover>
            <span v-else>{{ row.name }}</span>
          </template>
          <!-- Group -->
          <template #group-data="{ row }">
            <UPopover v-if="row.groupDescription" mode="hover" class="h-5 w-5">
              {{ row.group }}
              <template #panel>
                <div class="p-3 text-xs">
                  <p>{{ row.groupDescription }}</p>
                </div>
              </template>
            </UPopover>
            <span v-else>{{ row.group }}</span>
          </template>
          <!-- Errors -->
          <template #error-data="{ row }">
            <UBadge v-if="row.error !== null" :color="row.error > 0 ? 'red' : 'green'">{{ row.error }}</UBadge>
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts">
import { type ChannelGroupModel } from "@ukkidney/ukrdc-axios-ts";

import BaseLoadingIndicator from "~/components/base/BaseLoadingIndicator.vue";
import useApi from "~/composables/useApi";

interface ChannelRow {
  id: string;
  group: string;
  groupDescription: string | undefined;
  name: string;
  channelDescription: string | undefined;
  revision: string;
  received: number | null;
  sent: number | null;
  error: number | null;
  filtered: number | null;
  queued: number | null;
}

export default defineComponent({
  components: {
    BaseLoadingIndicator,
  },
  setup() {
    const { mirthApi } = useApi();

    // Data refs
    const mirthGroups = ref<ChannelGroupModel[]>();

    const mirthChannels = computed<ChannelRow[]>(() => {
      const channels: ChannelRow[] = [];
      if (mirthGroups.value) {
        mirthGroups.value.forEach((group) => {
          group.channels.forEach((channel) => {
            channels.push({
              id: channel.id,
              group: group.name,
              groupDescription: group.description,
              name: channel.name,
              channelDescription: channel.description,
              revision: channel.revision,
              received: channel.statistics ? channel.statistics.received : null,
              sent: channel.statistics ? channel.statistics.sent : null,
              error: channel.statistics ? channel.statistics.error : null,
              filtered: channel.statistics ? channel.statistics.filtered : null,
              queued: channel.statistics ? channel.statistics.queued : null,
            });
          });
        });
      }
      return channels;
    });

    // Data fetching
    onMounted(() => {
      mirthApi
        .getMirthGroups()
        .then((response) => {
          mirthGroups.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    // Table columns
    const columns = [
      {
        key: "group",
        label: "Group",
        sortable: true,
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "revision",
        label: "Revision",
        sortable: true,
      },
      {
        key: "received",
        label: "Received",
        sortable: true,
      },
      {
        key: "sent",
        label: "Sent",
        sortable: true,
      },
      {
        key: "error",
        label: "Error",
        sortable: true,
      },
      {
        key: "filtered",
        label: "Filtered",
        sortable: true,
      },
      {
        key: "queued",
        label: "Queued",
        sortable: true,
      },
    ];

    return {
      mirthGroups,
      mirthChannels,
      columns,
    };
  },

  head: {
    title: "Mirth Channels",
  },
});
</script>
