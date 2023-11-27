<!-- eslint-disable vue/no-v-html -->
<template>
  <BaseSkeleDiv class="h-72 w-full">
    <div class="flex h-full w-full flex-col items-center justify-center">
      <p>{{ loadingText }}</p>
    </div>
  </BaseSkeleDiv>
</template>

<script lang="ts">

import BaseSkeleDiv from "~/components/base/BaseSkeleDiv.vue";
import useInterval from "~/composables/useInterval";

export default defineComponent({
  components: {
    BaseSkeleDiv,
  },
  setup() {
    const { timeSinceMount } = useInterval();

    const loadingText = computed<string>(() => {
      if (timeSinceMount.value >= 30) {
        return "An internal error may have occurred. Please try again later.";
      }
      if (timeSinceMount.value >= 10) {
        return "Calculations are taking longer than usual...";
      }
      if (timeSinceMount.value >= 1) {
        return "Calculating...";
      }
      return "";
    });

    return {
      loadingText,
    };
  },
});
</script>
