<template>
  <div class="flex cursor-pointer items-center" @click="toggle()">
    <span>
      <svg
        v-if="!modelValue"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
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
