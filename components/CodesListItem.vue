<!--
Single item of the codes list used in the Codes page.
-->

<template>
  <div class="grid w-full min-w-0 grid-cols-2 px-4 py-4 text-gray-800 sm:px-6 md:gap-4 lg:grid-cols-3">
    <!-- Heading -->
    <div class="col-span-2">
      <CodeTitle :code="code.code" :coding-standard="code.codingStandard" />
      <p class="mt-2 truncate">
        {{ code.description || "No description found" }}
      </p>
    </div>
    <!-- Extra fields  -->
    <div class="col-span-1 hidden lg:block">
      <div>
        <h5 class="inline">Type:</h5>
        <p class="inline">{{ code.objectType || "None" }}</p>
      </div>
      <div class="mt-2">
        <h5 class="inline">Units:</h5>
        <p class="inline">{{ code.units || "None" }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type CodeSchema } from "@ukkidney/ukrdc-axios-ts";

import CodeTitle from "~/components/CodeTitle.vue";

export default defineComponent({
  components: {
    CodeTitle,
  },
  props: {
    code: {
      type: Object as () => CodeSchema,
      required: true,
    },
  },
});
</script>
