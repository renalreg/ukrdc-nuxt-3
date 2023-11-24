<template id="editor">
  <div>
    <textarea
      ref="textAreaEl"
      :value="modelValue"
      :maxLength="maxLength"
      class="sm: mb-4 block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      @input="onInput"
    ></textarea>
    <div v-if="maxLength">
      <h5 :class="[modelValue && modelValue.length >= maxLength ? 'text-red-600' : '']">
        {{ modelValue ? modelValue.length : 0 }}/{{ maxLength }}
      </h5>
    </div>
  </div>
</template>

<script lang="ts">

export default defineComponent({
  props: {
    modelValue: {
      default: "",
      type: String,
    },
    maxLength: {
      type: Number,
      default: undefined,
      required: false,
    },
    focus: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup(props, { emit }) {
    const textAreaEl = ref<HTMLTextAreaElement>();

    onMounted(() => {
      if (props.focus) {
        textAreaEl.value?.focus();
      }
    });

    function onInput(event: Event) {
      const value = ((event.target) as HTMLInputElement).value
      emit("update:modelValue", value);
    }

    return { textAreaEl, onInput };
  },
});
</script>
