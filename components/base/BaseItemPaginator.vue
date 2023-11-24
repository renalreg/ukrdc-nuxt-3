<template>
  <nav class="flex items-center justify-between overflow-hidden px-2 py-2" aria-label="Pagination">
    <div class="hidden sm:block">
      <p class="text-gray-700">
        {{ itemLabel }}
        <span class="font-medium">{{ modelValue + 1 }}</span>
        of
        <span class="font-medium">{{ total }}</span>
      </p>
    </div>
    <div class="flex flex-1 justify-between sm:justify-end">
      <button
        :class="{ invisible: modelValue <= 0 }"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        @click="prev()"
      >
        Previous
      </button>
      <button
        :class="{ invisible: modelValue + 1 >= total }"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        @click="next()"
      >
        Next
      </button>
    </div>
  </nav>
</template>

<script lang="ts">


export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: false,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    itemLabel: {
      type: String,
      required: false,
      default: "Item",
    },
  },
  emits: [
    "update:modelValue"
  ],
  setup(props, { emit }) {
    function next(): void {
      emit("update:modelValue", props.modelValue + 1);
    }

    function prev(): void {
      emit("update:modelValue", props.modelValue - 1);
    }

    return { next, prev };
  },
});
</script>

<style></style>
