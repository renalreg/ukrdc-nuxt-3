<template>
  <div>
    <div class="mx-auto mb-4 max-w-7xl">
      <h1>Data Files</h1>
    </div>

    <div class="mb-4 flex flex-col">
      <BaseDateRange v-model="dateRange" class="mb-4" />
      <BaseSelectSearchable
        v-if="facilityIds.length > 1"
        v-model="selectedFacility"
        class="mb-4"
        :options="facilityIds"
        :labels="facilityLabels"
        hint="Select a facility..."
      />
      <div class="flex flex-col gap-2 lg:flex-row">
        <BaseCollapseHeader v-model="advancedOpen" class="flex-grow" label="More Options"></BaseCollapseHeader>

        <USelectMenu v-model="statuses" :options="['STORED', 'RECEIVED', 'ERROR', 'RESOLVED']" multiple placeholder="Select status" />

        <form v-show="!nationalId" class="flex" @submit.prevent="nationalId = nationalIdSearchString.trim()">
          <UButtonGroup size="sm" orientation="horizontal">
            <UInput 
              v-model="nationalIdSearchString"
              placeholder="Filter by Patient Number"
            />
            <UButton type="submit" color="white" label="Go"/>
          </UButtonGroup>
        </form>

        <UButton v-show="nationalId" size="sm" @click="nationalId = null">Show Results From All Patients</UButton>

        <UButton
          class="flex-shrink"
          @click="toggleOrder"
          color="white"
          variant="solid"
          size="sm"
          :label="orderAscending ? 'Oldest - Newest' : 'Newest - Oldest'"
          :icon="orderAscending ? 'i-heroicons-bars-arrow-up-20-solid' : 'i-heroicons-bars-arrow-down-20-solid'"
        />
      </div>
    </div>

    <!-- More Options -->
    <div v-show="advancedOpen">
      <BaseSelectSearchable
        v-if="channelIds.length > 1"
        v-model="selectedChannel"
        class="mb-4"
        :options="channelIds"
        :labels="channelLabels"
        hint="Select a message channel..."
        :show-labels-only="true"
      />
    </div>

    <UCard :ui="{body: { padding: '' }}">
      <!-- Skeleton results -->
      <div v-if="fetchInProgress">
        <ul v-if="fetchInProgress" class="divide-y divide-gray-300">
          <BaseSkeleListItem v-for="n in 10" :key="n" />
        </ul>
      </div>
      <!-- Real results -->
      <div v-else>
        <ul class="divide-y divide-gray-300">
          <li v-for="item in messages" :key="item.id" class="hover:bg-gray-50">
            <NuxtLink :to="`/messages/${item.id}`">
              <MessagesListItem :item="item" />
            </NuxtLink>
          </li>
        </ul>
        <BasePaginator
          class="border-t border-gray-200 bg-white"
          :page="page"
          :size="size"
          :total="total"
          @next="page++"
          @prev="page--"
          @jump="page = $event"
        />
      </div>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type MessageSchema, OrderBy } from "@ukkidney/ukrdc-axios-ts";

import BaseCollapseHeader from "~/components/base/BaseCollapseHeader.vue";
import BaseDateRange from "~/components/base/BaseDateRange.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSelectSearchable from "~/components/base/BaseSelectSearchable.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import IconBarsArrowDown from "~/components/icons/hero/20/solid/IconBarsArrowDown.vue";
import IconBarsArrowUp from "~/components/icons/hero/20/solid/IconBarsArrowUp.vue";
import MessagesListItem from "~/components/messages/MessagesListItem.vue";
import useDateRange from "~/composables/query/useDateRange";
import usePagination from "~/composables/query/usePagination";
import useQuery from "~/composables/query/useQuery";
import useSortBy from "~/composables/query/useSortBy";
import useApi from "~/composables/useApi";
import useChannels from "~/composables/useChannels";
import useFacilities from "~/composables/useFacilities";
import usePermissions from "~/composables/usePermissions";
import { nowString } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BasePaginator,
    BaseDateRange,
    BaseSelectSearchable,
    BaseCollapseHeader,
    IconBarsArrowDown,
    IconBarsArrowUp,
    MessagesListItem,
  },
  setup() {
    const { page, total, size } = usePagination();
    const { makeDateRange } = useDateRange();
    const { stringQuery, arrayQuery } = useQuery();

    const { facilities, facilityIds, facilityLabels, selectedFacility } = useFacilities();
    const { channels, channelIds, channelLabels, selectedChannel } = useChannels();

    const { orderAscending, orderBy, toggleOrder } = useSortBy();
    const { messagesApi } = useApi();
    const { isAdmin } = usePermissions();

    // Set up URL query params for additional filters
    const nationalId = stringQuery("nationalid", null, true, true);
    const nationalIdSearchString = ref<string>("");

    // Set initial date dateRange
    const dateRange = makeDateRange(isAdmin ? nowString(-30) : nowString(-365), nowString(0), true);

    // Data refs
    const messages = ref<MessageSchema[]>();
    const statuses = arrayQuery("status", ["ERROR"], true, true);

    const advancedOpen = ref(false);

    const fetchInProgress = ref(false);

    // Data fetching
    function getMessages() {
      fetchInProgress.value = true;

      messagesApi
        .getMessages({
          page: page.value || 1,
          size: size.value,
          orderBy: orderBy.value as OrderBy,
          status: statuses.value.filter((n) => n) as string[],
          since: dateRange.value.start || undefined,
          until: dateRange.value.end || undefined,
          facility: selectedFacility.value || undefined,
          channel: [selectedChannel.value].filter((n) => n) as string[],
          ni: [nationalId.value].filter((n) => n) as string[],
        })
        .then((response) => {
          messages.value = response.data.items;
          total.value = response.data.total;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        })
        .finally(() => {
          fetchInProgress.value = false;
        });
    }

    onMounted(() => {
      // Auto-open advanced options if any are active
      if (selectedChannel.value) {
        advancedOpen.value = true;
      }
      getMessages();
    });

    watch(
      [
        page,
        orderBy,
        selectedFacility,
        selectedChannel,
        nationalId,
        () => JSON.stringify(dateRange.value), // Stringify to watch for actual value changes
        () => JSON.stringify(statuses.value), // Stringify to watch for actual value changes
      ],
      () => {
        getMessages();
      },
    );

    return {
      fetchInProgress,
      advancedOpen,
      page,
      total,
      size,
      dateRange,
      messages,
      statuses,
      facilities,
      facilityIds,
      facilityLabels,
      selectedFacility,
      channels,
      channelIds,
      channelLabels,
      selectedChannel,
      nationalId,
      nationalIdSearchString,
      orderAscending,
      orderBy,
      toggleOrder,
    };
  },

  head: {
    title: "Data Files",
  },
});
</script>
