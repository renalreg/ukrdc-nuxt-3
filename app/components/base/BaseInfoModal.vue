<template>
  <div>
    <UTooltip :text="tooltip">
      <UIcon
        name="i-heroicons-information-circle"
        class="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-800"
        @click="isOpen = true"
      />
    </UTooltip>

    <UModal v-model="isOpen">
      <slot />
    </UModal>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    tooltip: {
      type: String,
      required: false,
      default: "Click to show info",
    },
  },

  setup() {
    const isOpen = ref(false);

    return { isOpen };
  },
});
</script>
