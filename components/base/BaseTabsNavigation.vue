<!-- Tabs component formatted as a tab line. Tab elements include a name and href, and trigger router navigation on click. -->

<template>
  <div :class="[sticky ? 'sticky top-4 z-50' : '']">
    <div :class="[eagerToCollapse ? 'lg:hidden' : 'sm:hidden']">
      <USelect v-model="selectValue" :options="tabs" option-attribute="name" value-attribute="href" />
    </div>
    <div class="hidden" :class="[eagerToCollapse ? 'lg:block' : 'sm:block']">
      <nav :class="[mini ? 'tab-nav-mini' : 'tab-nav-primary']" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.href"
          role="tab"
          :class="[
            mini ? 'tab-base-mini' : 'tab-base-primary',
            { 'tab-active-mini': tabIsActive(tab) && mini },
            { 'tab-active-primary': tabIsActive(tab) && !mini },
            { 'tab-inactive-mini': !tabIsActive(tab) && mini },
            { 'tab-inactive-primary': !tabIsActive(tab) && !mini },
          ]"
          :aria-current="tabIsActive(tab) ? 'page' : undefined"
          @click="$emit('change', tab)"
        >
          {{ tab.name }}
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { urlCompare, urlStartsWith } from "~/helpers/pathUtils";
import { type TabItem } from "~/interfaces/tabs";

export default defineComponent({
  props: {
    tabs: {
      type: Array as () => TabItem[],
      required: true,
    },
    mini: {
      type: Boolean,
      required: false,
      default: false,
    },
    id: {
      type: String,
      required: false,
      default: "tabs",
    },
    sticky: {
      type: Boolean,
      required: false,
      default: false,
    },
    eagerToCollapse: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();

    // We need to allow our select component's current value to account for tabs having children,
    // so we use tabIsActive to find the current active tab, and set the value to that.
    // Without this, any href tab items with children will break the currently selected tab in
    // the select/option UI for these tabs.
    const selectValue = computed<string | undefined>({
      get() {
        for (const tab of props.tabs) {
          if (tabIsActive(tab)) {
            return tab.href;
          }
        }
      },
      set(href: string | undefined) {
        if (href) {
          router.push({ path: href });
          emit("change", href);
        }
      },
    });

    function tabIsActive(tab: TabItem) {
      if (tab.hasChildren) {
        return urlStartsWith(route.path, tab.href);
      }
      return urlCompare(route.path, tab.href);
    }

    return { selectValue, tabIsActive };
  },
});
</script>

<style scoped lang="postcss">
.tab-nav-primary {
  @apply -mb-px flex space-x-6 border-b border-gray-200;
}

.tab-base-primary {
  @apply whitespace-nowrap border-b-2 px-1 py-4 font-medium;
}

.tab-active-primary {
  @apply border-indigo-500 text-indigo-600;
}

.tab-inactive-primary {
  @apply border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700;
}

.tab-nav-mini {
  @apply inline-flex space-x-2 rounded-lg bg-gray-100 p-1;
}

.tab-base-mini {
  @apply rounded-md px-2 py-2 font-medium capitalize text-gray-600;
}

.tab-active-mini {
  @apply bg-white text-gray-900 shadow;
}

.tab-inactive-mini {
  @apply text-gray-500 hover:text-gray-700;
}
</style>
