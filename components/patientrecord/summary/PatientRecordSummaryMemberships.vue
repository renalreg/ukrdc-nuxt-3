<template>
  <ul>
    <li
      v-for="(item, index) in record.programMemberships"
      :key="item.programName + index"
      class="col-span-1 flex rounded-md shadow-sm"
    >
      <UCard class="w-full truncate">
        <UTooltip :text="item.programName" :ui="{ wrapper: 'truncate block' }">
          <b>{{ item.programName }}</b>
        </UTooltip>
        <p v-if="item.fromTime">Since {{ formatDate(item.fromTime, false) }}</p>
        <div class="mt-2">
          <BaseBadge v-if="!item.toTime" class="bg-green-100 text-green-800">Active</BaseBadge>
          <BaseBadge v-else class="bg-red-100 text-red-800">Closed on {{ formatDate(item.toTime, false) }}</BaseBadge>
        </div>
      </UCard>
    </li>
  </ul>
</template>

<script lang="ts">
import { type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseBadge from "~/components/base/BaseBadge.vue";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseBadge,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },
  setup() {
    return {
      formatDate,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
