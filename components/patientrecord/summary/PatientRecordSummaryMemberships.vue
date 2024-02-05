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
          <UBadge v-if="!item.toTime" color="green">Active</UBadge>
          <UBadge v-else color="red">Closed on {{ formatDate(item.toTime, false) }}</UBadge>
        </div>
      </UCard>
    </li>
  </ul>
</template>

<script lang="ts">
import { type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
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
