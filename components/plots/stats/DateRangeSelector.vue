<template>
  <div class="date-range-selector">
    <div class="slider">
      <label for="timePeriod">Select Time Period:</label>
      <input
        type="range"
        id="timePeriod"
        min="0"
        max="2"
        v-model="timePeriodIndex"
      />
      <span>{{ timePeriods[timePeriodIndex] }}</span>
    </div>

    <div class="slider">
      <label for="dateToggle">Toggle Date Range:</label>
      <input
        type="checkbox"
        id="dateToggle"
        v-model="isNow"
      />
      <span>{{ isNow ? 'Now' : 'Most Recent Quarter' }}</span>
    </div>
    <div>
      <span>{{ formatDate(fromTime) }} to {{ formatDate(toTime) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { DateTime } from 'luxon';

export default defineComponent({
  name: 'DateRangeSelector',
  setup(_, { emit }) {
    const timePeriods = ['30 days', '90 days', '365 days'];
    const timePeriodIndex = ref(1);
    const isNow = ref(true);

    // Reactive toTime based on isNow
    const toTime = computed(() => {
      if (isNow.value) {
        return new Date();
      } else {
        const now = DateTime.now();
        const currentQuarter = Math.floor((now.month - 1) / 3) + 1;
        const quarterStartMonth = (currentQuarter - 1) * 3 + 1;
        return DateTime.local(now.year, quarterStartMonth, 1)
          .startOf('month')
          .toJSDate();
      }
    });

    // Reactive fromTime based on toTime and timePeriodIndex
    const fromTime = computed(() => {
      const daysAgo = [30, 90, 365][timePeriodIndex.value];
      const newFromTime = new Date(toTime.value);
      newFromTime.setDate(newFromTime.getDate() - daysAgo);
      return newFromTime;
    });

    const formatDate = (date: Date) => {
      return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
    };

    // Watch for changes and emit updates
    watch([timePeriodIndex, isNow], () => {
      emit('date-range-updated', { 
        fromTime: fromTime.value, 
        toTime: toTime.value,
        timePeriod: timePeriods[timePeriodIndex.value],
        isNow: isNow.value
      });
    }, { immediate: true });

    // Emit individual events if needed (optional)
    watch(timePeriodIndex, (newIndex) => {
      emit('time-period-changed', timePeriods[newIndex]);
    });

    watch(isNow, (newIsNow) => {
      emit('date-range-toggled', toTime.value);
    });

    return {
      timePeriods,
      timePeriodIndex,
      isNow,
      fromTime,
      toTime,
      formatDate
    };
  },
});
</script>

<style scoped>
.date-range-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: Arial, sans-serif;
}

.slider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.date-range-selector span {
  font-family: inherit;
}
</style>