<template>
  <div class="flex flex-col gap-4 lg:flex-row">
    <div class="flex flex-none gap-2">
      <UButton
        size="sm"
        :color="lastNDays === 7 ? 'primary' : 'white'"
        @click="setLastNDays(7)"
      >
        Last 7 days
      </UButton>
      <UButton
        size="sm"
        :color="lastNDays === 30 ? 'primary' : 'white'"
        @click="setLastNDays(30)"
      >
        Last 30 days
      </UButton>
      <UButton
        size="sm"
        :color="lastNDays === 365 ? 'primary' : 'white'"
        @click="setLastNDays(365)"
      >
        Last year
      </UButton>
      <UButton
        size="sm"
        :color="lastNDays === 3650 ? 'primary' : 'white'"
        @click="setLastNDays(3650)"
      >
        Last 10 years
      </UButton>
      <UButton
        size="sm"
        :color="showCustom ? 'primary' : 'white'"
        @click="showCustom = true"
      >
        Custom
      </UButton>
      <UButton
        variant="outline"
        size="sm"
        color="red"
        @click="clear()"
      >
        Clear
      </UButton>
    </div>
    <div v-show="showCustom" class="flex h-8 w-full flex-1">
      <VDatePicker
        class="w-full"
        :model-value="modelValue"
        @update:modelValue="onInput"
        :is24hr="true"
        :popover="{ visibility: 'hidden', placement: 'bottom' }"
        :step="1"
        mode="dateTime"
        color="indigo"
        is-range
      >
        <template #default="{ inputValue, inputEvents, showPopover }">
          <div
            class="flex h-full flex-row items-center justify-start"
            @click="showPopover"
          >
            <div class="relative h-full w-full flex-grow">
              <svg
                class="pointer-events-none absolute mx-2 h-full w-4 text-gray-600"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <input
                :class="textBoxClasses"
                :value="inputValue.start"
                v-on="inputEvents.start"
              />
            </div>
            <span class="m-2 flex-shrink-0">
              <svg
                class="h-4 w-4 stroke-current text-gray-600"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
            <div class="relative h-full w-full flex-grow">
              <svg
                class="pointer-events-none absolute mx-2 h-full w-4 text-gray-600"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <input
                :class="textBoxClasses"
                :value="inputValue.end"
                v-on="inputEvents.end"
              />
            </div>
          </div>
        </template>
      </VDatePicker>
    </div>
  </div>
</template>

<script lang="ts">
import { type DateRange, nowString } from "~/helpers/dateUtils";

interface DatePickerRange {
  start: Date | null;
  end: Date | null;
}

export default defineComponent({
  props: {
    modelValue: {
      type: Object as () => DateRange,
      required: false,
      default: () => ({
        start: nowString(-365),
        end: nowString(),
      }),
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const showCustom = ref(false);

    const textBoxClasses =
      "flex-grow pl-8 pr-2 py-1 w-full h-full bg-white border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 truncate";

    function clear(): void {
      showCustom.value = false;
      emit("update:modelValue", { start: null, end: null });
    }

    const lastNDays = computed((): number | null => {
      if (showCustom.value) {
        return null;
      }
      if (props.modelValue.start && props.modelValue.end) {
        return Math.round(
          (Date.parse(props.modelValue.end) -
            Date.parse(props.modelValue.start)) /
            (1000 * 3600 * 24)
        );
      }
      return null;
    });

    function setLastNDays(daysAgo: number): void {
      showCustom.value = false;
      const newRange: DateRange = {
        start: nowString(-daysAgo),
        end: nowString(0),
      };
      emit("update:modelValue", newRange);
    }

    function onInput(value: DatePickerRange) {
      const emitValue = {
        start: value.start?.toISOString(),
        end: value.end?.toISOString(),
      };
      emit("update:modelValue", emitValue);
    }

    return {
      showCustom,
      textBoxClasses,
      lastNDays,
      setLastNDays,
      clear,
      onInput,
    };
  },
});
</script>

<style scoped>
:deep(select) {
  background-image: none;
}
</style>
