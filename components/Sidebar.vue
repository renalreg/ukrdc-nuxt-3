<template>
  <div class="flex w-64 flex-1 flex-col bg-gray-50">
    <div class="h-0 flex-1 overflow-y-auto pb-4 pt-6">
      <div class="mb-2 flex flex-shrink-0 items-center px-4">
        <img class="h-auto w-full" src="~/assets/UKKA_UKRDC.svg" alt="Workflow" />
      </div>
      <div v-if="deploymentEnv !== 'production'" class="bg-yellow-700 py-2 text-center capitalize text-white">
        {{ deploymentEnv }}
      </div>
      <nav class="mt-6 space-y-1 px-2">
        <div v-for="item in pages" :key="item.key">
          <div v-if="item.visible && item.url">
            <NuxtLink
              :to="item.url"
              class="group flex items-center rounded-md px-2 py-2 text-lg font-medium"
              :class="[
                $route.path == item.url
                  ? ['bg-gray-100', 'text-gray-900']
                  : ['text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900'],
              ]"
              @click="$emit('toggle')"
            >
              <UIcon v-if="item.icon" class="mr-4 h-6 w-6 text-gray-500" :name="item.icon" />
              {{ item.title }}
            </NuxtLink>
          </div>
          <div v-else-if="item.visible">
            <h3
              :id="item.title + '_Heading'"
              class="mb-3 mt-5 px-3 text-sm font-semibold uppercase tracking-wider text-gray-500"
            >
              {{ item.title }}
            </h3>
          </div>
        </div>
      </nav>
    </div>

    <div v-if="showProfile" class="flex flex-shrink-0 border-t border-gray-200 p-1">
      <ProfileBadge />
    </div>
  </div>
</template>

<script lang="ts">
import ProfileBadge from "~/components/ProfileBadge.vue";
import usePermissions from "~/composables/usePermissions";

interface NavItem {
  title: string;
  key: string;
  url: string;
  svg: string;
  visible: boolean;
  icon: string | undefined;
}

export default defineComponent({
  components: {
    ProfileBadge,
  },
  props: {
    showProfile: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: ["toggle"],
  setup() {
    const { hasPermission, availableFacilities, firstFacility, hasMultipleFacilities } = usePermissions();
    const runtimeConfig = useRuntimeConfig();

    const deploymentEnv = runtimeConfig.public.deploymentEnv;

    const pages = computed(() => {
      return [
        // Dashboard for multi-facility users
        {
          title: "Dashboard",
          key: "dashboard",
          url: "/",
          icon: "i-heroicons-home",
          visible: hasMultipleFacilities.value,
        },
        // Dashboard for single-facility users
        {
          title: "Dashboard",
          key: "dashboard-single-unit",
          url: firstFacility.value ? `/facilities/${firstFacility.value}` : "/",
          icon: "i-heroicons-home",
          visible: !hasMultipleFacilities.value && availableFacilities.value?.length === 1,
        },
        {
          title: "Records",
          key: "records",
          url: "/patientrecords",
          icon: "i-heroicons-circle-stack",
          visible: hasPermission("ukrdc:records:read"),
        },
        {
          title: "Data Admin",
          key: "data-admin",
          visible:
            hasPermission("ukrdc:workitems:read") ||
            hasPermission("ukrdc:workitems:write") ||
            hasPermission("ukrdc:messages:read") ||
            hasPermission("ukrdc:messages:write"),
        },
        {
          title: "EMPI",
          key: "empi",
          url: "/empi",
          icon: "i-heroicons-user-group",
          visible: hasPermission("ukrdc:empi:write"),
        },
        {
          title: "Work Items",
          key: "work-items",
          url: "/workitems",
          icon: "i-heroicons-link",
          visible: hasPermission("ukrdc:workitems:read"),
        },
        {
          title: "Data Files",
          key: "messages",
          url: "/messages",
          icon: "i-heroicons-inbox-arrow-down",
          visible: hasPermission("ukrdc:messages:read") || hasPermission("ukrdc:messages:write"),
        },
        {
          title: "System",
          visible:
            hasPermission("ukrdc:mirth:read") ||
            hasPermission("ukrdc:mirth:write") ||
            hasPermission("ukrdc:codes:read") ||
            hasPermission("ukrdc:codes:write") ||
            hasMultipleFacilities.value,
        },
        {
          title: "Facilities",
          key: "facilities",
          url: "/facilities",
          icon: "i-heroicons-building-office",
          visible: hasMultipleFacilities.value,
        },
        {
          title: "Channels",
          key: "mirth",
          url: "/mirth",
          icon: "i-heroicons-code-bracket-square",
          visible: hasPermission("ukrdc:mirth:read"),
        },
        {
          title: "Codes",
          key: "codes",
          url: "/codes",
          icon: "i-heroicons-book-open",
          visible: hasPermission("ukrdc:codes:read"),
        },
      ] as NavItem[];
    });

    return { pages, deploymentEnv };
  },
});
</script>
