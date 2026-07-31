<template>
  <UCard>
    <template #header>
      <h2>Satellites</h2>
    </template>
    <ul>
      <li v-for="satellite in satellites" :key="satellite.sourceCode" class="py-4">
        Source code: {{ satellite.sourceCode }}
      </li>
    </ul>
  </UCard>
</template>

<script lang="ts">
import type { CodeMapSchema } from "@ukkidney/ukrdc-axios-ts";

export default defineComponent({
  props: {
    satellites: {
      type: Array as () => CodeMapSchema[],
      required: true,
    }
  },

});
</script>