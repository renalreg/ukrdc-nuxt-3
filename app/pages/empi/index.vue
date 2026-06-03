<template>
  <div>
    <h1 class="mb-4">Enterprise Master Patient Index</h1>
    <h2 class="mb-4">EMPI Management</h2>
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <QuickLink
        title="Merge"
        description="Merge Master Records within the EMPI, moving all Patient Records to a combined Master Record"
        icon="i-heroicons-document-duplicate"
        href="/empi/merge"
      />
    </div>
    <h2 class="mb-4">EMPI Health</h2>
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <QuickLink
        title="Multiple UKRDC IDs"
        description="View and manage patients with multiple UKRDC IDs"
        icon="i-heroicons-exclamation-triangle"
        href="/empi/multipleids"
      />
      <QuickLink
        title="Record Work Items"
        description="View records with the largest number of open Work Items"
        icon="i-heroicons-link"
        href="/empi/recordworkitems"
      />
    </div>
  </div>
</template>

<script lang="ts">
import QuickLink from "~/components/QuickLink.vue";

export default defineComponent({
  components: {
    QuickLink,
  },
});
</script>
