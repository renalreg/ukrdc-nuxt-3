<!--
Pill/breadcrumb-styled checkbox component, able to v-model onto either a single boolean value,
or an array of values when multiple instances are v-model'd onto the same array.
-->

<template>
  <label class="wrapper inline-flex cursor-pointer items-center font-medium">
    <input
      v-model="model"
      class="peer sr-only"
      :class="{ 'checkpill-disabled': disabled }"
      type="checkbox"
      :disabled="disabled"
      :value="value"
    />
    <UBadge :color="color" :variant="isChecked ? 'solid' : 'subtle'" :class="{ 'opacity-50': disabled }">
      {{ label }}
    </UBadge>
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
    color: {
      type: String,
      required: false,
      default: "neutral",
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

    // Works whether modelValue is a plain boolean, or an array (multi-checkpill v-model)
    const isChecked = computed(() => {
      if (Array.isArray(props.modelValue)) {
        return props.modelValue.includes(props.value);
      }
      return !!props.modelValue;
    });

    return { model, isChecked };
  },
});
</script>
