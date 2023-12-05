<template>
  <UCard v-if="record.pvdata" class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
    <div>
      <h5>RRT Status</h5>
      <p>{{ record.pvdata.rrtstatus ?? "Unknown" }}</p>
    </div>
    <div>
      <h5>Transplant Status</h5>
      <p>{{ record.pvdata.tpstatus ?? "Unknown" }}</p>
    </div>
    <div>
      <h5>Blood Group</h5>
      <p>{{ record.pvdata.bloodgroup ?? "Unknown" }}</p>
    </div>
    <div>
      <h5>Last Updated</h5>
      <p>{{ formatDate(record.pvdata.updateDate ?? record.pvdata.creationDate, true) }}</p>
    </div>
  </UCard>
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
