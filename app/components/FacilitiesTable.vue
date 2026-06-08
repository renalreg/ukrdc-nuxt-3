<!--
Table of facilities and their basic statistics
-->

<template>
  <div>
    <SearchBar v-model="searchboxString" :focus="false" :show-button="false" />

    <UCard :ui="{ body: { padding: '' } }">
      <UTable
        :data="filteredFacilities"
        :columns="columns"
        :ui="ui"
        :loading="loading"
        @select="(_, row) => navigateTo(`/facilities/${row.original.id}`)"
      >
        <!-- Failing records -->
        <template #patientsReceivingMessageError-data="{ row }">
          <span class="flex items-center">
            <IconCircle
              class="inline"
              :class="
                row.original.statistics.patientsReceivingMessageError && row.original.statistics.patientsReceivingMessageError > 0
                  ? 'text-red-700'
                  : 'text-green-600'
              "
            />
            <p>{{ row.original.statistics.patientsReceivingMessageError }}</p>
          </span>
        </template>
        <!-- Sending to PKB -->
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #dataFlow.pkbOut-data="{ row }">
          <span class="flex items-center">
            <IconCircle class="inline" :class="row.original.dataFlow.pkbOut ? 'text-green-600' : 'text-red-700'" />
            <p>{{ row.original.dataFlow.pkbOut ? "Yes" : "No" }}</p>
          </span>
        </template>
        <!-- Last received -->
        <template #lastMessageReceivedAt-data="{ row }">
          <span class="flex items-center gap-2">
            <div>
              {{ row.original.lastMessageReceivedAt ? formatDate(row.original.lastMessageReceivedAt, false) : "> Year Ago" }}
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
import type { FacilityDetailsSchema } from "@ukkidney/ukrdc-axios-ts";

import IconCircle from "~/components/icons/IconCircle.vue";
import SearchBar from "~/components/SearchBar.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";
import { facilityLastMessageOver48 } from "~/helpers/facilityUtils";

export default defineComponent({
  components: {
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
  },
  emits: ["select"],
  setup(props) {
    const { facilitiesApi } = useApi();

    // Facility list and filters

    const facilities = ref<FacilityDetailsSchema[]>();
    const searchboxString = ref("");

    const filterByPkbOut = ref(false);
    const filterByLastMessageOver48 = ref(false);

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
          // Filter by additional filters, such as PkbOut
          .filter((option) => (filterByPkbOut.value ? option.dataFlow.pkbOut : true))
          // Filter by last message over 48 hours
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

    const columns = [
      {
        id: "id",
         accessorKey: "id",
        header: "ID",
      },
      {
        id: "description",
         accessorKey: "description",
        header: "Name",
        enableSorting: true,
      },
      {
        id: "statistics.totalPatients",
         accessorKey: "statistics.totalPatients",
        header: "Total records",
        enableSorting: true,
      },
      {
        id: "statistics.patientsReceivingMessageError",
         accessorKey: "statistics.patientsReceivingMessageError",
        header: "Failing records",
        enableSorting: true,
      },
      {
        id: "dataFlow.pkbOut",
         accessorKey: "dataFlow.pkbOut",
        header: "Sending to PKB",
        enableSorting: true,
      },
      {
        id: "lastMessageReceivedAt",
         accessorKey: "lastMessageReceivedAt",
        header: "Last received",
        enableSorting: true,
      },
    ];

    return {
      facilities,
      columns,
      loading,
      searchboxString,
      filterByPkbOut,
      filterByLastMessageOver48,
      filteredFacilities,
      facilityLastMessageOver48,
      formatDate,
      ui,
    };
  },
});
</script>
