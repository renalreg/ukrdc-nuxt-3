<template>
  <!-- This example requires Tailwind CSS v2.0+ -->
  <div class="flex h-screen overflow-hidden bg-white">
    <!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
    <USlideover v-model="sbOpen" class="flex-0 w-64 md:hidden" side="left">
      <Sidebar :show-close-button="true" :show-profile="false" class="relative" @toggle="toggle()" />
    </USlideover>

    <!-- Static sidebar for desktop -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col">
        <Sidebar class="h-0 border-r border-gray-200" />
      </div>
    </div>

    <!-- Main page -->
    <div class="flex w-0 flex-1 flex-col overflow-hidden">
      <!-- Mobile menu bar -->
      <div class="z-10 flex h-16 flex-shrink-0 items-center border-b border-gray-200 bg-white md:hidden">
        <!-- Sidebar menu button -->
        <div class="justify-left inline-flex flex-grow items-center">
          <button
            class="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            @click="toggle()"
          >
            <span class="sr-only">Open sidebar</span>
            <UIcon name="i-heroicons-bars-3" class="h-6 w-6" />
          </button>
        </div>

        <div class="mr-1 flex flex-shrink-0">
          <ProfileBadge :right-to-left="true" :top-to-bottom="true" />
        </div>
      </div>

      <!-- Main page content -->
      <main class="relative z-0 flex-1 overflow-y-auto focus:outline-none" tabindex="0">
        <div class="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import ProfileBadge from "~/components/ProfileBadge.vue";
import Sidebar from "~/components/Sidebar.vue";
import useSensitive from "~/composables/useSensitive";

useHead({
  meta: [{ name: "description", content: "My amazing site." }],
});

export default defineComponent({
  components: {
    Sidebar,
    ProfileBadge,
  },
  setup() {
    const { sensitiveCssFilter } = useSensitive();

    const sbOpen = ref(false);

    function toggle() {
      sbOpen.value = !sbOpen.value;
    }

    return { sbOpen, toggle, sensitiveCssFilter };
  },
  head: {},
});
</script>

<style lang="postcss">
.sensitive {
  filter: v-bind(sensitiveCssFilter);
}
</style>
