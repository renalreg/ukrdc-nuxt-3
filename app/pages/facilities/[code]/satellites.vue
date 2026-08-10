<template>
  <!-- List of satellites for the main unit -->
  <UCard :ui="{ body: { padding: '' } }">
    <UTable :data="satellites" :columns="satelliteTableColumns" :ui="ui" />
  </UCard>
</template>

<script lang="ts">
import type { FacilitySchema  } from "@ukkidney/ukrdc-axios-ts";

export default defineComponent({
  props: {
    satellites: {
      type: Array as () => FacilitySchema[],
      required: true,
    }
  },
  setup() {  
    const satelliteTableColumns = [
      { accessorKey: "id", header: "Id" },
      { accessorKey: "description", header: "Name" },
    ];

    const ui = {
      th: { base: "px-6 py-3" },
      td: { base: "px-6 py-4 whitespace-nowrap" },
    };

    return {
      satelliteTableColumns,
      ui,
    };
  }
});
</script>