
<!--
Table of facilities and their basic statistics
-->

<template>
  <div>
    <SearchBar v-model="searchboxString" :focus="false" :show-button="false" />

    <div v-if="isAdmin && showMoreOptions" class="mb-4">
      <BaseCollapseHeader v-model="advancedOpen" :label="moreOptionsLabel" />
      <div v-if="advancedOpen" class="mt-4 flex items-end gap-2">
        <UFormField label="Facility type" class="flex-1">
          <USelect v-model="facilityTypeFilter" :items="facilityTypeOptions" class="w-full" />
        </UFormField>
        <UFormField label="Sending to PKB" class="flex-1">
          <USelect v-model="pkbOutFilter" :items="pkbOutOptions" class="w-full" />
        </UFormField>
        <UButton label="Clear" @click="clearFilters" />
      </div>
    </div>

    <UCard :ui="{ body: { padding: '' } }">
      <UTable
        :data="filteredFacilities"
        :columns="columns"
        :ui="ui"
        :loading="loading"
        @select="(_, row) => navigateTo(`/facilities/${row.original.id}`)"
      >
        <!-- Failing records -->
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #statistics.patientsReceivingMessageError-cell="{ row }">
          <span class="flex items-center">
            <IconCircle
              class="inline"
              :class="
                row.original.statistics.patientsReceivingMessageError &&
                row.original.statistics.patientsReceivingMessageError > 0
                  ? 'text-red-700'
                  : 'text-green-600'
              "
            />
            <p>{{ row.original.statistics.patientsReceivingMessageError }}</p>
          </span>
        </template>
        <!-- Sending to PKB -->
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #dataFlow.pkbOut-cell="{ row }">
          <span class="flex items-center">
            <IconCircle class="inline" :class="row.original.dataFlow.pkbOut ? 'text-green-600' : 'text-red-700'" />
            <p>{{ row.original.dataFlow.pkbOut ? "Yes" : "No" }}</p>
          </span>
        </template>
        <!-- Last received -->
        <template #lastMessageReceivedAt-cell="{ row }">
          <span class="flex items-center gap-2">
            <div>
              {{
                row.original.lastMessageReceivedAt
                  ? formatDate(row.original.lastMessageReceivedAt, false)
                  : "> Year Ago"
              }}
            </div>
            <UTooltip v-if="facilityLastMessageOver48(row.original)" text="No files received in over 48 hours">
              <UIcon name="i-heroicons-exclamation-triangle" class="inline h-6 w-6 text-yellow-600" />
            </UTooltip>
          </span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { FacilityDetailsSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseCollapseHeader from "~/components/base/BaseCollapseHeader.vue";
import IconCircle from "~/components/icons/IconCircle.vue";
import SearchBar from "~/components/SearchBar.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { formatDate } from "~/helpers/dateUtils";
import { facilityLastMessageOver48 } from "~/helpers/facilityUtils";
import { getSortableHeader } from "~/helpers/tableSortHeader";

export default defineComponent({
  components: {
    BaseCollapseHeader,
    IconCircle,
    SearchBar,
  },
  props: {
    includeEmpty: {
      // Should facilities with no UKRDC records be included in the list?
      type: Boolean,
      default: false,
      required: false,
    },
    includeInactive: {
      // Should facilities with no feed files in the last year be included in the list?
      type: Boolean,
      default: false,
      required: false,
    },
    showMoreOptions: {
      // Should admin users see the More Options filters?
      type: Boolean,
      default: false,
      required: false,
    },
  },
  emits: ["select"],
  setup(props) {
    const { facilitiesApi } = useApi();
    const { isAdmin } = usePermissions();
    
    // Facility list and filters

    const facilities = ref<FacilityDetailsSchema[]>();
    const searchboxString = ref("");

    const filterByLastMessageOver48 = ref(false);

    const allFilterOption = "All";
    const advancedOpen = ref(false);
    const facilityTypeFilter = ref(allFilterOption);
    const pkbOutFilter = ref(allFilterOption);

    const facilityTypeOptions = computed(() => {
      const types = (facilities.value ?? [])
        .map((facility) => facility.facilityMetadata?.facilityType)
        .filter((type) => type != null);

      const uniqueTypes = types.filter((type, index) => types.indexOf(type) === index).sort();

      return [allFilterOption, ...uniqueTypes];
    });

    const pkbOutOptions = [allFilterOption, "Yes", "No"];

    function clearFilters() {
      facilityTypeFilter.value = allFilterOption;
      pkbOutFilter.value = allFilterOption;
    }

    const moreOptionsLabel = computed(() => {
      const count = [facilityTypeFilter.value, pkbOutFilter.value].filter((value) => value !== allFilterOption).length;
      if (advancedOpen.value || count === 0) return "More Options";
      return `More Options (${count} ${count === 1 ? "filter" : "filters"} applied)`;
    });

    const filteredFacilities = computed(() => {
      if (!facilities.value) return [];
      return (
        facilities.value
          // Filter by search term
          .filter(
            (option) =>
              option.id.toLowerCase().includes(searchboxString.value.toLowerCase()) ||
              option.description?.toLowerCase().includes(searchboxString.value.toLowerCase()),
          )
          // Filter by facility type
          .filter(
            (option) =>
              facilityTypeFilter.value === allFilterOption ||
              option.facilityMetadata?.facilityType === facilityTypeFilter.value,
          )
          // Filter by PKB out flag
          .filter(
            (option) => {
              if (pkbOutFilter.value === "Yes") return option.dataFlow.pkbOut;
              if (pkbOutFilter.value === "No") return !option.dataFlow.pkbOut;
              return true;
            })
          // Filter by last message over 48 hours (not in use anywhere)
          .filter((option) => (filterByLastMessageOver48.value ? facilityLastMessageOver48(option) : true))
      );
    });

    // Data fetching
    const loading = ref(false);

    function fetchTable() {
      loading.value = true;
      facilitiesApi
        .getFacilityList({
          includeInactive: props.includeInactive,
          includeEmpty: props.includeEmpty,
        })
        .then((response) => {
          facilities.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        })
        .finally(() => {
          loading.value = false;
        });
    }

    onMounted(() => {
      fetchTable();
    });

    watch(
      () => [props.includeInactive, props.includeEmpty],
      () => {
        fetchTable();
      },
    );

    const ui = {
      th: {
        base: "px-4 py-3",
      },
      td: {
        base: "px-4 py-4 whitespace-nowrap",
      },
    };

    const columns: TableColumn<FacilityDetailsSchema>[] = [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => getSortableHeader(column, "Name"),
        enableSorting: true,
      },
      {
        id: "statistics.totalPatients",
        accessorKey: "statistics.totalPatients",
        header: ({ column }) => getSortableHeader(column, "Total records"),
        enableSorting: true,
      },
      {
        id: "statistics.patientsReceivingMessageError",
        accessorKey: "statistics.patientsReceivingMessageError",
        header: ({ column }) => getSortableHeader(column, "Failing records"),
        enableSorting: true,
      },
      {
        id: "dataFlow.pkbOut",
        accessorKey: "dataFlow.pkbOut",
        header: ({ column }) => getSortableHeader(column, "Sending to PKB"),
        enableSorting: true,
      },
      {
        id: "lastMessageReceivedAt",
        accessorKey: "lastMessageReceivedAt",
        header: ({ column }) => getSortableHeader(column, "Last received"),
        enableSorting: true,
      },
    ];

      return {
      facilities,
      columns,
      loading,
      searchboxString,
      filterByLastMessageOver48,
      filteredFacilities,
      facilityLastMessageOver48,
      formatDate,
      ui,
      isAdmin,
      advancedOpen,
      facilityTypeFilter,
      facilityTypeOptions,
      pkbOutFilter,
      pkbOutOptions,
      moreOptionsLabel,
      clearFilters,
    };
  },
});
</script>