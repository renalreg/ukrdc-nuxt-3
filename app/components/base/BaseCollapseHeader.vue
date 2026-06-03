<template>
  <div class="flex cursor-pointer items-center" @click="toggle()">
    <span class="h-5 w-5">
      <UIcon v-if="!modelValue" class="h-5 w-5" name="i-heroicons-chevron-right-16-solid" />
      <UIcon v-else class="h-5 w-5" name="i-heroicons-chevron-down-16-solid" />
    </span>
    <h5>{{ label }}</h5>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      required: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    function toggle(): void {
      emit("update:modelValue", !props.modelValue);
    }

    return {
      toggle,
    };
  },
});
</script>
