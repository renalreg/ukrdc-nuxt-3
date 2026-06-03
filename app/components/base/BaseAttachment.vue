<template>
  <div class="flex items-center justify-between">
    <div class="flex w-0 flex-1 items-center">
      <UIcon name="i-heroicons-paper-clip" class="mr-2 h-5 w-5" />
      <p class="sensitive w-0 flex-1 truncate">
        {{ filename }}
      </p>
    </div>
    <div class="ml-4 flex flex-shrink-0 gap-4">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    filename: {
      type: String,
      required: true,
    },
  },
});
</script>
