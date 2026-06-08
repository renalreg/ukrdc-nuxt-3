<template>
  <div>
    <div class="mx-auto mb-4 flex">
      <div class="flex-grow">
        <h1>Codes List</h1>
      </div>
      <div>
        <UDropdownMenu :items="exportMenuItems">
          <UButton color="neutral" label="Export codes" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdownMenu>
      </div>
    </div>

    <div v-if="standards && standards.length > 1" :class="$route.params.id ? 'hidden lg:flex' : 'flex'" class="mb-4">
      <USelectMenu
        v-model="selectedStandard"
        class="flex-1"
        size="lg"
        :items="standards"
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
      <div class="sticky top-4 grow">
        <NuxtLink v-show="$route.params.id" class="w-full lg:hidden" :to="{ path: `/codes/`, query: $route.query }">
          <UButton class="mb-4 w-full">Back to List</UButton>
        </NuxtLink>
        <UCard :class="$route.params.id ? 'block' : 'hidden lg:block'" :ui="{ body: { padding: '' } }">
          <NuxtPage />
        </UCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { CodeSchema } from "@ukkidney/ukrdc-axios-ts";

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

    // ─── Pagination tuning ────────────────────────────────────────────────────
    // To change how many items are fetched per backend request, update
    // BACKEND_PAGE_SIZE. Must be a multiple of UI_PAGE_SIZE, and must not
    // exceed the server-side `le` cap (currently le=40 in paginate.py).
    //
    //   UI_PAGE_SIZE=20, BACKEND_PAGE_SIZE=20  → 1 UI page per fetch (no batching)
    //   UI_PAGE_SIZE=20, BACKEND_PAGE_SIZE=40  → 2 UI pages per fetch  ← current
    //   UI_PAGE_SIZE=20, BACKEND_PAGE_SIZE=60  → 3 UI pages per fetch  (needs le≥60)
    // ─────────────────────────────────────────────────────────────────────────
    const UI_PAGE_SIZE = 20;
    const BACKEND_PAGE_SIZE = 40;
    const pagesPerFetch = BACKEND_PAGE_SIZE / UI_PAGE_SIZE;

    // Data refs

    const standards = ref<string[]>();
    const selectedStandard = stringQuery("standard", undefined, true, true);

    const allCodes = ref([] as CodeSchema[]);
    const selectedCode = ref<CodeSchema>();

    const searchboxString = stringQuery("search", undefined, true, true);

    const fetchInProgress = ref(false);

    // The backend page currently loaded in memory
    const loadedBackendPage = ref<number | null>(null);

    // Codes slice shown for the current UI page
    const codes = computed(() => {
      if (!allCodes.value.length) return [];
      const uiPage = page.value ?? 1;
      const offsetWithinBatch = ((uiPage - 1) % pagesPerFetch) * UI_PAGE_SIZE;
      return allCodes.value.slice(offsetWithinBatch, offsetWithinBatch + UI_PAGE_SIZE);
    });

    // Code exporting

    function exportCodeList() {
      codesApi
        .getCodeListExport({ responseType: "text" } as any)
        .then(({ data }) => {
          const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
          saveAs(blob, "code-list.csv");
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    function exportCodeMaps() {
      codesApi
        .getCodeMapsExport({ responseType: "text" } as any)
        .then(({ data }) => {
          const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
          saveAs(blob, "code-maps.csv");
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    function exportCodeExclusions() {
      codesApi
        .getCodeExclusionsExport({ responseType: "text" } as any)
        .then(({ data }) => {
          const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
          saveAs(blob, "code-exclusions.csv");
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    // Data fetching — only fires a network request when the backend page changes.
    function getBackendPageForUiPage(uiPage: number): number {
      return Math.ceil(uiPage / pagesPerFetch);
    }

    function getCodes(forceRefetch = false) {
      const uiPage = page.value ?? 1;
      const backendPage = getBackendPageForUiPage(uiPage);

      // Skip the network call if we already have this backend page cached
      if (!forceRefetch && loadedBackendPage.value === backendPage) return;

      fetchInProgress.value = true;

      codesApi
        .getCodeList({
          page: backendPage,
          size: BACKEND_PAGE_SIZE,
          codingStandard: selectedStandard.value ? [selectedStandard.value] : undefined,
          search: searchboxString.value || undefined,
        })
        .then((response) => {
          allCodes.value = response.data.items;
          total.value = response.data.total ?? 0;
          loadedBackendPage.value = backendPage;
          // Keep `size` at UI_PAGE_SIZE so BasePaginator renders correctly
          size.value = UI_PAGE_SIZE;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
        })
        .finally(() => {
          fetchInProgress.value = false;
        });
    }

    onMounted(() => {
      codesApi.getCodingStandardsList().then((response) => {
        standards.value = response.data;
      });
      getCodes();
    });

    watch([page], () => {
      getCodes();
    });

    // When filters change, reset to page 1 and force a fresh fetch
    watch([selectedStandard, searchboxString], () => {
      page.value = 1;
      loadedBackendPage.value = null;
      getCodes(true);
    });

    const exportMenuItems = [
      {
        label: "Export Code List",
        icon: "i-heroicons-list-bullet-20-solid",
        onSelect: () => exportCodeList(),
      },
      {
        label: "Export Code Maps",
        icon: "i-heroicons-map-20-solid",
        onSelect: () => exportCodeMaps(),
      },
      {
        label: "Export Code Exclusions",
        icon: "i-heroicons-x-circle-20-solid",
        onSelect: () => exportCodeExclusions(),
      },
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
