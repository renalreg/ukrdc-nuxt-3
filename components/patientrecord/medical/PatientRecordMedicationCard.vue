<template>
  <UCard>
    <div class="mb-2">
      <p class="line-clamp-2 font-medium text-gray-900 hover:text-gray-600">
        {{ item.drugProductGeneric }}
      </p>
      <p v-if="item.comment" class="text-gray-500">
        {{ item.comment }}
      </p>
    </div>

    <p v-if="item.enteringOrganizationCode" class="text-gray-500">Entered by {{ item.enteringOrganizationCode }}</p>
    <p v-if="item.enteringOrganizationDescription" class="text-gray-500">
      {{ item.enteringOrganizationDescription }}
    </p>
    <p v-if="item.fromTime" class="text-gray-500">Since {{ formatDate(item.fromTime, false) }}</p>
    <span
      v-if="!item.toTime"
      class="mt-2 inline-block rounded-sm bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800"
      >Active</span
    >
    <span v-else class="mt-2 inline-block rounded-sm bg-red-100 px-2 py-0.5 text-sm font-medium text-red-800"
      >Inactive since {{ formatDate(item.toTime, false) }}</span
    >
  </UCard>
</template>

<script lang="ts">
import { type MedicationSchema } from "@ukkidney/ukrdc-axios-ts";

import { formatGender } from "~/helpers/codeUtils";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  props: {
    item: {
      type: Object as () => MedicationSchema,
      required: true,
    },
  },
  setup() {
    return { formatDate, formatGender };
  },
});
</script>
