<template>
  <BaseLoadingIndicator v-if="!code"></BaseLoadingIndicator>
  <div v-else-if="code" class="flex flex-col gap-4">
    <div class="flex flex-col gap-4 pl-4 sm:pl-6">
      <!-- Heading -->
      <div>
        <CodeTitle :code="code.code" :coding-standard="code.codingStandard" />
        <p class="mt-2">
          {{ code.description ?? "No description found" }}
        </p>
      </div>
      <!-- Extra fields  -->
      <div>
        <div>
          <h5 class="inline">Type:</h5>
          <p class="inline">{{ code.objectType ?? "None" }}</p>
        </div>
        <div class="mt-2">
          <h5 class="inline">Units:</h5>
          <p class="inline">{{ code.units ?? "None" }}</p>
        </div>
      </div>
      <!-- Code lifecycle  -->
      <div>
        <div>
          <h5 class="inline">Created:</h5>
          <p class="inline">{{ formatDate(code.creationDate) }}</p>
        </div>
        <div class="mt-2">
          <h5 class="inline">Updated:</h5>
          <p class="inline">{{ code.updateDate ? formatDate(code.updateDate) : "Never updated" }}</p>
        </div>
      </div>
      <!-- Links -->
      <div v-if="externalLink">
        <a :href="externalLink" target="_blank">{{ externalLink }}</a>
      </div>
    </div>

    <!-- Maps to  -->
    <div v-if="code.mapsTo.length > 0">
      <div class="mb-4 border-b border-t bg-gray-50 py-1 pl-4 sm:pl-6">
        <h4>Maps To</h4>
      </div>
      <div class="flex flex-col gap-4 divide-y divide-gray-300">
        <CodeMapItem
          v-for="mappedCode in code.mapsTo"
          :key="`${mappedCode.destinationCodingStandard}.${mappedCode.destinationCode}`"
          :map="mappedCode"
        />
      </div>
    </div>

    <!-- Mapped by  -->
    <div v-if="code.mappedBy.length > 0">
      <div class="mb-4 border-b border-t bg-gray-50 py-1 pl-4 sm:pl-6">
        <h4>Mapped By</h4>
      </div>
      <div class="flex flex-col gap-4 divide-y divide-gray-300">
        <CodeMapItem
          v-for="mappedCode in code.mappedBy"
          :key="`${mappedCode.sourceCodingStandard}.${mappedCode.sourceCode}`"
          :map="mappedCode"
        />
      </div>
    </div>

    <!-- PKB Attributes  -->
    <div v-if="code.pkbReferenceRange || code.pkbComment">
      <div class="border-b border-t bg-gray-50 py-1 pl-4 sm:pl-6">
        <h4>PKB Attributes</h4>
      </div>
      <div class="px-4 py-4 sm:px-6">
        <div>
          <h5 class="inline">Reference range:</h5>
          <p class="inline">{{ code.pkbReferenceRange }}</p>
        </div>
        <div class="mt-2">
          <h5>Comment:</h5>
          <p class="whitespace-pre-wrap">{{ code.pkbComment }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import { type ExtendedCodeSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseLoadingIndicator from "~/components/base/BaseLoadingIndicator.vue";
import CodeMapItem from "~/components/CodeMapItem.vue";
import CodeTitle from "~/components/CodeTitle.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";
import { getFirstOrValue } from "~/helpers/queryUtils";

export default defineComponent({
  components: {
    BaseLoadingIndicator,
    CodeTitle,
    CodeMapItem,
  },
  setup() {
    const route = useRoute();
    const { codesApi } = useApi();

    // Head
    useHead({
      title: `Code ${route.params.id}`,
    });

    // Data refs

    const code = ref<ExtendedCodeSchema>();

    // Data fetching

    function getCode() {
      // Fetch code details

      codesApi
        .getCodeDetails({
          code: getFirstOrValue(route.params.id).split(".")[1],
          codingStandard: getFirstOrValue(route.params.id).split(".")[0],
        })
        .then((response) => {
          code.value = response.data;
        });
    }

    onMounted(() => {
      getCode();
    });

    watch(
      () => route.params.id, // Watch the computed (reactive) value of params.id
      () => {
        getCode();
      },
    );

    // External code links

    const externalLink = computed(() => {
      if (!code.value) {
        return null;
      }
      if (code.value.codingStandard === "LOINC") {
        return `https://loinc.org/${code.value.code}/`;
      }
      if (code.value.codingStandard === "SNOMED") {
        return `https://termbrowser.nhs.uk/?perspective=full&conceptId1=${code.value.code}`;
      }
      return null;
    });

    return { formatDate, externalLink, code };
  },
  head: {},
});
</script>
