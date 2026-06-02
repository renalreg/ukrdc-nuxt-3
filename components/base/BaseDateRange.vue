<template>
  <div class="flex flex-col gap-4 lg:flex-row">
    <div class="flex flex-none gap-2">
      <UButton
        v-for="preset in presetDateRanges"
        :key="preset.label"
        size="sm"
        :color="isLastNDays(preset.days) ? 'primary' : 'white'"
        :variant="isLastNDays(preset.days) ? 'outline' : 'solid'"
        @click="setLastNDays(preset.days)"
      >
        {{ preset.label }}
      </UButton>
      <UButton
        size="sm"
        :color="showCustom ? 'primary' : 'white'"
        :variant="showCustom ? 'outline' : 'solid'"
        @click="showCustom = true"
      >
        Custom
      </UButton>
      <UButton variant="outline" size="sm" color="red" @click="clear()"> Clear </UButton>
    </div>
    <div v-show="showCustom" class="flex h-8 w-full flex-1">
      <VDatePicker
        v-model.range.string="modelValueProxy"
        class="w-full"
        :is24hr="true"
        :popover="{ visibility: 'hidden', placement: 'bottom' }"
        :step="1"
        mode="dateTime"
        color="indigo"
      >
        <template #default="{ inputValue, inputEvents, showPopover }">
          <div class="flex h-full flex-row items-center justify-start" @click="showPopover">
            <UInput
              icon="i-heroicons-calendar-20-solid"
              class="relative h-full w-full flex-grow"
              :value="inputValue.start"
              v-on="inputEvents.start"
            />
            <UIcon name="i-heroicons-arrow-right-20-solid" class="mx-2 h-4 w-4 flex-shrink-0 text-gray-600" />
            <UInput
              icon="i-heroicons-calendar-20-solid"
              class="relative h-full w-full flex-grow"
              :value="inputValue.end"
              v-on="inputEvents.end"
            />
          </div>
        </template>
      </VDatePicker>
    </div>
  </div>
</template>

<script lang="ts">
import { type DateRange, nowString } from "~/helpers/dateUtils";

interface PresetRangeItem {
  label: string;
  days: number;
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

    const presetDateRanges: PresetRangeItem[] = [
      { label: "Last 7 days", days: 7 },
      { label: "Last 30 days", days: 30 },
      { label: "Last year", days: 365 },
      { label: "Last 10 years", days: 3650 },
    ];

    function clear(): void {
      showCustom.value = false;
      emit("update:modelValue", { start: null, end: null });
    }

    const lastNDays = computed((): number | null => {
      if (showCustom.value) {
        return null;
      }
      if (props.modelValue.start && props.modelValue.end) {
        return Math.round((Date.parse(props.modelValue.end) - Date.parse(props.modelValue.start)) / (1000 * 3600 * 24));
      }
      return null;
    });

    function setLastNDays(daysAgo: number): void {
      showCustom.value = false;
      const newRange: DateRange = {
        start: nowString(-daysAgo) ?? undefined,
        end: nowString(0) ?? undefined,
      };
      emit("update:modelValue", newRange);
    }

    function isLastNDays(days: number): boolean {
      return lastNDays.value === days;
    }

    // Proxy object for the v-calendar model value.
    // This allows us to use v-calendar model modifiers (https://vcalendar.io/datepicker/basics.html#model-modifiers)
    // specifically v-model.range.string to get a range of ISO formatted dates,
    // and pass the modified model values back up to the parent component.
    const modelValueProxy = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        emit("update:modelValue", value);
      },
    });

    return {
      presetDateRanges,
      showCustom,
      lastNDays,
      setLastNDays,
      isLastNDays,
      clear,
      modelValueProxy,
    };
  },
});
</script>

<style scoped>
:deep(select) {
  background-image: none;
}
</style>
