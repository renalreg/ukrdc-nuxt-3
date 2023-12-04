<template>
  <div
    class="group grid w-full min-w-0 grid-cols-2 gap-2 px-4 py-4 text-gray-800 sm:grid-cols-3 sm:px-6 lg:grid-cols-5"
  >
    <!-- Heading -->
    <div class="col-span-5 lg:col-span-3">
      <div class="flex items-center gap-2">
        <div class="truncate">
          <h5 class="sensitive truncate md:inline">
            {{ item.filename || "Internal file" }}
          </h5>
          <h5 class="truncate md:inline">
            {{ item.mirthChannel ? `on ${item.mirthChannel}` : "" }}
          </h5>
        </div>
        <BaseInfoTooltip v-if="!item.filename" class="inline">
          <p>This usually corresponds to a file internally sent to update RADAR membership details.</p>
        </BaseInfoTooltip>
      </div>

      <div class="mt-2 flex">
        <BadgeMessageStatus class="mr-2 flex-shrink" :message="item" />
        <p class="line-clamp-1 flex-grow">
          {{ itemDescription }}
        </p>
      </div>
    </div>
    <!-- Recieved  -->
    <div class="col-span-2 lg:col-span-1">
      <p>From <SendingFacilityLink class="inline" :code="item.facility" /></p>
      <p class="mt-2">
        {{ item.received ? formatDate(item.received) : "Unknown time" }}
      </p>
    </div>
    <!-- Identifiers  -->
    <div class="col-span-3 flex items-center gap-4 lg:col-span-1">
      <UTooltip v-if="showPatientFilter" text="Filter errors by this patient">
        <UButton
          :ui="{ rounded: 'rounded-full' }"
          :class="!item.ni ? 'invisible' : ''"
          class="opacity-0 group-hover:opacity-100"
          :to="{ path: '/messages', query: { nationalid: item.ni } }"
          icon="i-heroicons-funnel-20-solid"
        />
      </UTooltip>

      <div class="flex-grow">
        <h5>Patient Number</h5>
        <p class="sensitive mt-2">
          {{ item.ni || "None Found" }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type MessageSchema } from "@ukkidney/ukrdc-axios-ts";

import BadgeMessageStatus from "~/components/BadgeMessageStatus.vue";
import BaseInfoTooltip from "~/components/base/BaseInfoTooltip.vue";
import SendingFacilityLink from "~/components/SendingFacilityLink.vue";
import useSensitive from "~/composables/useSensitive";
import { formatDate } from "~/helpers/dateUtils";
import { makeMessageSummary } from "~/helpers/messageUtils";

export default defineComponent({
  components: {
    BaseInfoTooltip,
    SendingFacilityLink,
    BadgeMessageStatus,
  },
  props: {
    item: {
      type: Object as () => MessageSchema,
      required: true,
    },
    showPatientFilter: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props) {
    const { sensitiveNumbers } = useSensitive();

    const itemDescription = computed(() => {
      return sensitiveNumbers(makeMessageSummary(props.item));
    });
    return { itemDescription, formatDate };
  },
});
</script>
