<!--
Pill/breadcrumb-styled checkbox component, able to v-model onto either a single boolean value,
or an array of values when multiple instances are v-model'd onto the same array.
-->

<template>
  <label class="wrapper flex items-center font-medium text-gray-500">
    <input
      v-model="model"
      class="peer sr-only"
      :class="{ 'checkpill-disabled': disabled }"
      type="checkbox"
      :disabled="disabled"
      :value="value"
    />
    <div :class="['peer', `checkpill-${colour}`]">
      {{ label }}
    </div>
  </label>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    label: {
      type: String,
      required: false,
      default: null,
    },
    modelValue: {
      type: [Array, Boolean],
      default: false,
    },
    value: {
      type: [String, Number, Boolean],
      required: false,
      default: null,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    colour: {
      type: String,
      required: false,
      default: "white",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const model = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit("update:modelValue", value);
      },
    });

    return { model };
  },
});
</script>
