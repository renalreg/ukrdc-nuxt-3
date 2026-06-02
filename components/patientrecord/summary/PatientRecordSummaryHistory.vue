<template>
  <UCard>
    <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <h5>Created</h5>
        <p>{{ formatDate(record.repositoryCreationDate, true) }}</p>
      </div>
      <div>
        <h5>Last Updated</h5>
        <p>{{ formatDate(record.repositoryUpdateDate, true) }}</p>
      </div>
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
