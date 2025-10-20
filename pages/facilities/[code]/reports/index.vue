<template>
  <div>
    <h2 class="mb-4">Data Flow and Memberships</h2>
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <QuickLink
        title="PKB Program Membership Report"
        description="List of patients with no active PKB membership record in their UKRDC RDA feed, preventing outbound data flow to Patients Know Best"
        icon="i-heroicons-cloud-arrow-up"
        href="./reports/pm001"
      />
    </div>
    <h2 class="mb-4">Data Management</h2>
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <QuickLink
        title="Unknown UKRDC Presence Report"
        description="List of patients with no treatment items or programme memberships to explain the presence of the record in the UKRDC RDA feed"
        icon="i-heroicons-table-cells"
        href="./reports/cc001"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { type FacilityDetailsSchema } from "@ukkidney/ukrdc-axios-ts";

import QuickLink from "~/components/QuickLink.vue";

export default defineComponent({
  components: {
    QuickLink,
  },
  props: {
    facility: {
      type: Object as () => FacilityDetailsSchema,
      required: true,
    },
  },

  setup() {
    return {};
  },
});
</script>
