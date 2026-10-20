<template>
  <div>
    <!-- Real results -->
    <UCard :ui="{ body: { padding: '' } }">
      <template #header>
        <h2>Records Currently Failing</h2>
        <div class="flex w-full">
          <div class="grow">
            <h5>Records where the most recent message received failed to process due to errors.</h5>
          </div>
          <BaseCollapseHeader v-model="advancedOpen" label="More Options" />
        </div>
        <!-- More Options -->
        <div v-show="advancedOpen" class="mt-4 flex">
          <USelectMenu
            v-model="selectedChannel"
            class="flex-1"
            size="lg"
            :items="channels"
            value-key="id"
            label-key="name"
            placeholder="Select a message channel"
          />
          <!-- Filters messages to those belonging to a patient with a PKB or RADAR record -->
          <USelectMenu
            v-model="selectedProgram"
            class="flex-1 ml-2"
            size="lg"
            :items="programs"
            placeholder="Select a program membership"
          />
          <UButton class="ml-2" size="lg" @click="clearFilters">Clear</UButton>
        </div>
      </template>
      <div v-if="errorMessages && errorMessagesTotal == 0" class="p-8 text-center">
        <p>No active failing records</p>
      </div>
      <div v-else>
        <!-- Skeleton results -->
        <ul v-if="!errorMessages" class="divide-y divide-gray-300">
          <BaseSkeleListItem v-for="n in 10" :key="n" />
        </ul>
        <!-- Real results -->
        <ul class="divide-y divide-gray-300">
          <li v-for="item in errorMessages" :key="item.id" :item="item" class="hover:bg-gray-50">
            <NuxtLink :to="`/messages/${item.id}`">
              <MessagesListItem :item="item" />
            </NuxtLink>
          </li>
        </ul>
      </div>
      <template #footer>
        <BasePaginator
          :jump-to-top="false"
          :page="errorMessagesPage"
          :size="errorMessagesSize"
          :total="errorMessagesTotal"
          @next="errorMessagesPage++"
          @prev="errorMessagesPage--"
          @jump="errorMessagesPage = $event"
        />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts">
import type { FacilityDetailsSchema, MessageSchema } from "@ukkidney/ukrdc-axios-ts";
import type { PlotDatum } from "plotly.js-dist-min";

import BaseCollapseHeader from "~/components/base/BaseCollapseHeader.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import MessagesListItem from "~/components/messages/MessagesListItem.vue";
import useApi from "~/composables/useApi";
import useChannels from "~/composables/useChannels";
import usePrograms from "~/composables/usePrograms";
import { getPointDateRange } from "~/helpers/chartUtils";

export default defineComponent({
  components: {
    BasePaginator,
    BaseSkeleListItem,
    BaseCollapseHeader,
    MessagesListItem,
  },
  props: {
    facility: {
      type: Object as () => FacilityDetailsSchema,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const { channels, selectedChannel } = useChannels();
    const { programs, selectedProgram } = usePrograms();
    const { facilitiesApi } = useApi();

    // Data refs
    const advancedOpen = ref(false);

    // Failing NIs data
    const errorMessages = ref<MessageSchema[]>();
    const errorMessagesPage = ref(1);
    const errorMessagesSize = ref(10);
    const errorMessagesTotal = ref(0);

    // History plot click handler
    function historyPointClickHandler(point: PlotDatum) {
      if (point.x) {
        const pointRange = getPointDateRange(point.x as string);
        router.push({
          path: "/messages",
          query: {
            since: pointRange.since,
            until: pointRange.until,
            facility: props.facility.id,
            status: ["ERROR", "RESOLVED"],
          },
        });
      }
    }

    function clearFilters() {
      router.replace({
        query: {
          channel: undefined,
          program: undefined,
        },
      });
    }

    // Data fetching
    function updateErrorMessages() {
      facilitiesApi
        .getFacilityPatientsLatestErrors({
          code: props.facility.id,
          page: errorMessagesPage.value,
          size: errorMessagesSize.value,
          channel: [selectedChannel.value].filter((n) => n) as string[],
          program: [selectedProgram.value].filter((n) => n) as string[],
        })
        .then((response) => {
          errorMessages.value = response.data.items;
          errorMessagesPage.value = response.data.page ?? 0;
          errorMessagesSize.value = response.data.size ?? 0;
          errorMessagesTotal.value = response.data.total ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    onMounted(() => {
      // Auto-open advanced options if any are active
      if (selectedChannel.value || selectedProgram.value) {
        advancedOpen.value = true;
      }
      updateErrorMessages();
    });

    watch([errorMessagesPage, selectedChannel, selectedProgram], () => {
      updateErrorMessages();
    });

    return {
      advancedOpen,
      errorMessages,
      errorMessagesPage,
      errorMessagesSize,
      errorMessagesTotal,
      channels,
      selectedChannel,
      programs,
      selectedProgram,
      clearFilters,
      historyPointClickHandler,
    };
  },
});
</script>
