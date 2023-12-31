<template>
  <div class="grid w-full min-w-0 grid-cols-3 px-4 py-4 text-gray-800 sm:px-6 md:gap-4 lg:grid-cols-4">
    <!-- IDs and description -->
    <div class="col-span-2">
      <span
        v-if="item.status == 3"
        class="inline-flex h-5 items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800"
      >
        Closed
      </span>
      <h5 v-if="item.person">
        <span class="sensitive inline capitalize">{{ item.person.givenname?.toLowerCase() }}</span>
        <span class="sensitive inline capitalize italic">{{ item.person.surname?.toLowerCase() }}</span>
        <span v-if="item.person && item.masterRecord">→</span>
        <span v-if="item.masterRecord" class="sensitive capitalize">
          {{ item.masterRecord.givenname?.toLowerCase() }}
        </span>
        <span v-if="item.masterRecord" class="sensitive capitalize italic">
          {{ item.masterRecord.surname?.toLowerCase() }}
        </span>
        <span v-else class="truncate capitalize text-red-800">Missing Record</span>
      </h5>
      <h5 v-else class="truncate capitalize text-red-800">Missing Record</h5>
      <p class="mt-2 truncate">{{ item.type }}: {{ item.description }}</p>
    </div>
    <!-- National ID -->
    <div class="hidden lg:block">
      <p v-if="item.masterRecord" class="sensitive">
        {{ item.masterRecord.nationalid.trim() }}
      </p>
      <p v-else-if="item.person" class="sensitive">
        {{ item.person.localid.trim() }}
      </p>
      <BadgeNationalID
        class="mt-2"
        :nationalid-type="item.masterRecord ? item.masterRecord.nationalidType : 'Unknown Type'"
      />
    </div>
    <!-- Last updated (small and up) -->
    <div>
      <p><SendingFacilityLink class="inline" :code="facility" /> via {{ extract }}</p>
      <p class="mt-2">
        {{ formatDate(item.creationDate) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { type WorkItemSchema } from "@ukkidney/ukrdc-axios-ts";

import BadgeNationalID from "~/components/BadgeNationalID.vue";
import SendingFacilityLink from "~/components/SendingFacilityLink.vue";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: { SendingFacilityLink, BadgeNationalID },
  props: {
    item: {
      type: Object as () => WorkItemSchema,
      required: true,
    },
  },
  setup(props) {
    const facility = computed(() => {
      if (props.item.person?.xrefEntries[0]?.sendingFacility) {
        return props.item.person?.xrefEntries[0]?.sendingFacility;
      } else {
        return "Unknown Facility";
      }
    });
    const extract = computed(() => {
      if (props.item.person?.xrefEntries[0]?.sendingExtract) {
        return props.item.person?.xrefEntries[0]?.sendingExtract;
      } else {
        return "Unknown Extract";
      }
    });
    return { formatDate, facility, extract };
  },
});
</script>
