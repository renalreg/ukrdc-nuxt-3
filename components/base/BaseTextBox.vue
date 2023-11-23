<template>
  <input
    ref="textBoxEl"
    class="block rounded-md border border-gray-300 bg-white py-2 placeholder-gray-500 focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    :value="modelValue"
    v-on:input="onInput"
  />
</template>

<script lang="ts">

export default defineComponent({
  props: {
    modelValue: {
      default: "",
      type: String,
    },
    focus: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: [
    'update:modelValue'
  ],
  setup(props, {emit}) {
    const textBoxEl = ref<HTMLFormElement>();

    onMounted(() => {
      if (props.focus) {
        textBoxEl.value?.focus();
      }
    });

    function onInput(event: Event) {
      const value = ((event.target) as HTMLInputElement).value
      emit("update:modelValue", value);
    }

    return { textBoxEl, onInput };
  },
});
</script>
