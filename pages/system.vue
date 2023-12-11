<template>
  <div>
    <h1 class="mb-4">Support</h1>
    <p>
      Please use the
      <a
        class="font-medium text-indigo-600 hover:text-indigo-500"
        href="https://renalregistry.atlassian.net/servicedesk/customer/portals"
        target="blank"
        >UK Kidney Association Help Center</a
      >
      to report issues with this application.
    </p>
    <p>Where possible, please copy in the configuration report using the button below.</p>

    <h2 class="my-4">System Configuration</h2>
    <div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UCard :ui="{ body: { padding: '' } }">
        <template #header>
          <h2>Client</h2>
        </template>
        <BaseCardDescriptionList>
          <BaseCardDescriptionItem>
            <dt>Environment</dt>
            <dd>{{ clientInfo.deploymentEnv }}</dd>
          </BaseCardDescriptionItem>
          <BaseCardDescriptionItem>
            <dt>Version Reference</dt>
            <dd>{{ clientInfo.githubRef }}</dd>
          </BaseCardDescriptionItem>
          <BaseCardDescriptionItem>
            <dt>Version Hash</dt>
            <dd>{{ clientInfo.githubSha }}</dd>
          </BaseCardDescriptionItem>
        </BaseCardDescriptionList>
      </UCard>

      <UCard :ui="{ body: { padding: '' } }">
        <template #header>
          <h2>Server</h2>
        </template>
        <BaseCardDescriptionList>
          <BaseCardDescriptionItem>
            <dt>Environment</dt>
            <dd v-if="serverInfo">{{ serverInfo.deploymentEnv }}</dd>
            <USkeleton v-else class="mb-2 h-6 w-3/4" />
          </BaseCardDescriptionItem>
          <BaseCardDescriptionItem>
            <dt>Version Reference</dt>
            <dd v-if="serverInfo">{{ serverInfo.githubRef }}</dd>
            <USkeleton v-else class="mb-2 h-6 w-3/4" />
          </BaseCardDescriptionItem>
          <BaseCardDescriptionItem>
            <dt>Version Hash</dt>
            <dd v-if="serverInfo">{{ serverInfo.githubSha }}</dd>
            <USkeleton v-else class="mb-2 h-6 w-3/4" />
          </BaseCardDescriptionItem>
        </BaseCardDescriptionList>
      </UCard>
    </div>
    <UButton @click="copyConfigReport">Copy Configuration Report</UButton>
  </div>
</template>

<script lang="ts">
import { type SystemInfoSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseCardDescriptionItem from "~/components/base/BaseCardDescriptionItem.vue";
import BaseCardDescriptionList from "~/components/base/BaseCardDescriptionList.vue";
import useApi from "~/composables/useApi";

export default defineComponent({
  components: {
    BaseCardDescriptionList,
    BaseCardDescriptionItem,
  },
  setup() {
    const toast = useToast();
    const { systemInfoApi } = useApi();
    const runtimeConfig = useRuntimeConfig();

    // Data refs

    const serverInfo = ref<SystemInfoSchema>();
    const clientInfo = ref({
      deploymentEnv: runtimeConfig.public.deploymentEnv,
      githubRef: runtimeConfig.public.git.githubRef,
      githubSha: runtimeConfig.public.git.githubSha,
    });

    // Data fetching

    onMounted(() => {
      systemInfoApi
        .getSystemInfo()
        .then((response) => {
          serverInfo.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    // Config reports

    const configReportJSON = computed(() => {
      return JSON.stringify(
        {
          server: serverInfo.value,
          client: clientInfo.value,
        },
        null,
        4,
      );
    });

    function copyConfigReport() {
      navigator.clipboard.writeText(configReportJSON.value).then(() => {
        toast.add({
          title: "Success",
          description: "Configuration Report copied to clipboard",
        });
      });
    }

    return {
      serverInfo,
      clientInfo,
      copyConfigReport,
    };
  },
  head: {
    title: "System Configuration",
  },
});
</script>
