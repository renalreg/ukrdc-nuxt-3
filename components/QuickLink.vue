<!--
Big link cards used in the EMPI page, to direct to Merge etc.
-->

<template>
  <UCard class="group relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
    <div>
      <span class="inline-flex rounded-lg bg-indigo-50 p-3 text-indigo-700 ring-4 ring-white">
        <UIcon :name="icon" class="h-6 w-6" />
      </span>
    </div>
    <div class="mt-4">
      <h3 class="text-lg font-medium">
        <NuxtLink :to="href" class="focus:outline-none">
          <!-- Extend touch target to entire panel -->
          <span class="absolute inset-0" aria-hidden="true"></span>
          {{ title }}
        </NuxtLink>
      </h3>
      <p>
        {{ description }}
      </p>
    </div>
    <span class="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
      <UIcon name="i-heroicons-arrow-up-right" class="h-6 w-6" />
    </span>
  </UCard>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    href: {
      type: String,
      required: true,
    },
  },
  setup() {},
});
</script>
