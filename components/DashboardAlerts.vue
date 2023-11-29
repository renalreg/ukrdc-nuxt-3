<template>
  <div v-if="dash && (dash.warnings.length > 0 || dash.messages.length > 0)">
    <UAlert
      color="orange"
      icon="i-heroicons-exclamation-triangle-20-solid"
      v-for="message in dash.warnings"
      :key="message"
      :title="message"
    />
    <UAlert
      icon="i-heroicons-information-circle-20-solid"
      v-for="message in dash.messages"
      :key="message"
      :title="message"
    />
  </div>
</template>

<script lang="ts">
import { type DashboardSchema } from "@ukkidney/ukrdc-axios-ts";

import useApi from "~/composables/useApi";

export default defineComponent({
  setup() {
    const { dashboardApi } = useApi();

    // Data refs

    const dash = ref<DashboardSchema>();

    onMounted(() => {
      dashboardApi.getDashboard().then((response) => {
        dash.value = response.data;
      });
    });

    return {
      dash,
    };
  },
});
</script>
