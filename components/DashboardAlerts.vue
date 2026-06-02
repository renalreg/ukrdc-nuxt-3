<template>
  <div v-if="dash && (dash.warnings.length > 0 || dash.messages.length > 0)">
    <UAlert
      v-for="message in dash.warnings"
      :key="message"
      color="orange"
      icon="i-heroicons-exclamation-triangle-20-solid"
      :title="message"
    />
    <UAlert
      v-for="message in dash.messages"
      :key="message"
      icon="i-heroicons-information-circle-20-solid"
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
      dashboardApi
        .getDashboard()
        .then((response) => {
          dash.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    return {
      dash,
    };
  },
});
</script>
