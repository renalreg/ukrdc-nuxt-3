<template>
  <div>
    <div class="mx-auto mb-4 flex">
      <div class="flex-grow">
        <h1>Codes List</h1>
      </div>
      <div>
        <UDropdown :items="exportMenuItems">
          <UButton color="white" label="Export codes" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </div>

    <div v-if="standards && standards.length > 1" :class="$route.params.id ? 'hidden lg:flex' : 'flex'" class="mb-4">
      <USelectMenu
        v-model="selectedStandard"
        searchable
        class="flex-1"
        size="lg"
        :options="standards"
        placeholder="Select a coding standard"
      />
      <UButton class="ml-2" size="lg" label="Clear" @click="selectedStandard = undefined" />
    </div>

    <div>
      <SearchBar v-model="searchboxString" :focus="false" :show-button="false" />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Code list -->
      <div :class="$route.params.id ? 'hidden lg:block' : 'block'">
        <UCard :ui="{ body: { padding: '' } }">
          <!-- Skeleton results -->
          <ul v-if="fetchInProgress" class="divide-y divide-gray-300">
            <BaseSkeleListItem v-for="n in 10" :key="n" />
          </ul>
          <!-- Real results -->
          <ul v-else class="divide-y divide-gray-300">
            <li v-for="code in codes" :key="`${code.codingStandard}.${code.code}`">
              <NuxtLink
                :to="{
                  path: `/codes/${code.codingStandard}.${code.code}/`,
                  query: $route.query,
                }"
              >
                <CodesListItem class="hover:bg-gray-50" :code="code" />
              </NuxtLink>
            </li>
          </ul>
          <template #footer>
            <BasePaginator
              :page="page"
              :size="size"
              :total="total"
              :show-pages="false"
              @next="page++"
              @prev="page--"
              @jump="page = $event"
            />
          </template>
        </UCard>
      </div>
      <!-- Code details -->
      <div class="sticky top-4 h-screen grow">
        <UButton
          v-show="$route.params.id"
          class="mb-4 w-full lg:hidden"
          :to="{ path: `/codes/`, query: $route.query }"
          label="Back to List"
        />
        <UCard :class="$route.params.id ? 'block' : 'hidden lg:block'" :ui="{ body: { padding: '' } }" class="py-4">
          <NuxtPage />
        </UCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type CodeSchema } from "@ukkidney/ukrdc-axios-ts";

import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import CodesListItem from "~/components/CodesListItem.vue";
import SearchBar from "~/components/SearchBar.vue";
import usePagination from "~/composables/query/usePagination";
import useQuery from "~/composables/query/useQuery";
import useApi from "~/composables/useApi";
import { saveAs } from "~/helpers/fileUtils";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BasePaginator,
    CodesListItem,
    SearchBar,
  },
  setup() {
    const { page, total, size } = usePagination();
    const { stringQuery } = useQuery();
    const { codesApi } = useApi();

    // Data refs

    const standards = ref<string[]>();
    const selectedStandard = stringQuery("standard", null, true, true);

    const codes = ref([] as CodeSchema[]);
    const selectedCode = ref<CodeSchema>();

    const searchboxString = stringQuery("search", null, true, true);

    const fetchInProgress = ref(false);

    // Code exporting

    function exportCodeList() {
      codesApi.getCodeListExport().then(({ data }) => {
        const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "code-list.csv");
      });
    }

    function exportCodeMaps() {
      codesApi.getCodeMapsExport().then(({ data }) => {
        const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "code-maps.csv");
      });
    }

    function exportCodeExclusions() {
      codesApi.getCodeExclusionsExport().then(({ data }) => {
        const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "code-exclusions.csv");
      });
    }

    // Data fetching
    function getCodes() {
      fetchInProgress.value = true;

      codesApi
        .getCodeList({
          page: page.value ?? 1,
          size: size.value,
          codingStandard: selectedStandard.value ? [selectedStandard.value] : undefined,
          search: searchboxString.value || undefined, // Leave undefined if value is falsey (e.g. empty string)
        })
        .then((response) => {
          codes.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
          fetchInProgress.value = false;
        });
    }

    onMounted(() => {
      codesApi.getCodingStandardsList().then((response) => {
        standards.value = response.data;
      });
      getCodes();
    });

    watch([page, selectedStandard, searchboxString], () => {
      getCodes();
    });

    const exportMenuItems = [
      [
        {
          label: "Export Code List",
          icon: "i-heroicons-list-bullet-20-solid",
          click: () => {
            exportCodeList();
          },
        },
        {
          label: "Export Code Maps",
          icon: "i-heroicons-map-20-solid",
          click: () => {
            exportCodeMaps();
          },
        },
        {
          label: "Export Code Exclusions",
          icon: "i-heroicons-x-circle-20-solid",
          click: () => {
            exportCodeExclusions();
          },
        },
      ],
    ];

    return {
      standards,
      selectedStandard,
      codes,
      selectedCode,
      searchboxString,
      fetchInProgress,
      page,
      total,
      size,
      exportMenuItems,
    };
  },
  head: {
    title: "Code List",
  },
});
</script>
