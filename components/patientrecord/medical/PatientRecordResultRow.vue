<template>
  <tr class="group">
    <td class="font-medium">{{ item.serviceId }} ({{ item.serviceIdDescription }})</td>
    <td>{{ item.value }} {{ item.valueUnits }}</td>
    <td class="flex items-center gap-2">
      <div class="flex-grow truncate text-gray-500">
        {{ item.orderId }}
      </div>
    </td>
    <td>
      {{ item.observationTime ? formatDate(item.observationTime) : "No Observation Time" }}
    </td>
    <td>
      <BadgePrePost v-if="item.prePost" :pre-post="item.prePost" />
    </td>
    <td class="flex gap-2 text-gray-500">
      <UButton
        :ui="{ rounded: 'rounded-full' }"
        class="opacity-0 group-hover:opacity-100"
        tooltip="Filter by this lab order"
        icon="i-heroicons-funnel-20-solid"
        :to="{ query: { order_id: item.orderId } }"
      />
      <UButton
        :ui="{ rounded: 'rounded-full' }"
        class="opacity-0 group-hover:opacity-100"
        tooltip="Delete this result item"
        icon="i-heroicons-trash-20-solid"
        @click="$emit('delete', item)"
      />
    </td>
  </tr>
</template>

<script lang="ts">
import { type ResultItemSchema } from "@ukkidney/ukrdc-axios-ts";

import BadgePrePost from "~/components/BadgePrePost.vue";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BadgePrePost,
  },
  props: {
    item: {
      type: Object as () => ResultItemSchema,
      required: true,
    },
  },
  emits: ["delete"],
  setup() {
    return { formatDate };
  },
});
</script>

<style scoped lang="postcss">
td {
  @apply whitespace-nowrap px-6 py-4;
}
</style>
