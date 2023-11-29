<template>
  <UIcon
    name="i-heroicons-exclamation-circle-20-solid"
    v-if="!verified"
    v-tooltip="'Value does not match other records for this patient'"
    class="-ml-1 mr-2 inline h-5 w-5 text-yellow-600"
  />
</template>

<script lang="ts">
export default defineComponent({
  props: {
    verified: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
