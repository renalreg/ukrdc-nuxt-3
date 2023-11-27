<template>
  <div>
    <h1 class="mb-2">Renal Facilities</h1>
    <div class="mb-4 flex flex-col gap-2">
      <UCheckbox
        v-model="includeInactive"
        label="Include facilities who have not sent any data files in the last 12 months"
      />
      <UCheckbox v-model="includeEmpty" label="Include facilities who have no patient records held in the UKRDC" />
    </div>

    <FacilitiesTable
      :include-empty="includeEmpty"
      :include-inactive="includeInactive"
      @select="$router.push({ path: `/facilities/${$event}` })"
    />
  </div>
</template>

<script lang="ts">
import FacilitiesTable from "~/components/FacilitiesTable.vue";

export default defineComponent({
  components: {
    FacilitiesTable,
  },
  setup() {
    const includeInactive = ref(true);
    const includeEmpty = ref(false);

    return { includeInactive, includeEmpty };
  },
});
</script>
