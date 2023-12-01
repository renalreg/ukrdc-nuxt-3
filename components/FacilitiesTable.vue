<!--
Table of facilities and their basic statistics
-->

<template>
  <div>
    <SearchBar v-model="searchboxString" :focus="false" :show-button="false" />

    <UCard :ui="{ body: { padding: '' } }">
      <UTable :rows="filteredFacilities" :columns="columns" @select="$emit('select', $event.id)">
        <!-- Failing records -->
        <template #statistics.patientsReceivingMessageError-data="{ row }">
          <span class="flex items-center">
            <IconCircle
              class="inline"
              :class="
                row.statistics.patientsReceivingMessageError && row.statistics.patientsReceivingMessageError > 0
                  ? 'text-red-700'
                  : 'text-green-600'
              "
            />
            <p>{{ row.statistics.patientsReceivingMessageError }}</p>
          </span>
        </template>
        <!-- Sending to PKB -->
        <template #dataFlow.pkbOut-data="{ row }">
          <span class="flex items-center">
            <IconCircle class="inline" :class="row.dataFlow.pkbOut ? 'text-green-600' : 'text-red-700'" />
            <p>{{ row.dataFlow.pkbOut ? "Yes" : "No" }}</p>
          </span>
        </template>
        <!-- Last received -->
        <template #lastMessageReceivedAt-data="{ row }">
          <span class="flex items-center gap-2">
            <div>
              {{ row.lastMessageReceivedAt ? formatDate(row.lastMessageReceivedAt, false) : "> Year Ago" }}
            </div>
            <UTooltip v-if="facilityLastMessageOver48(row)" text="No files received in over 48 hours">
              <UIcon name="i-heroicons-exclamation-triangle" class="inline h-6 w-6 text-yellow-600" />
            </UTooltip>
          </span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type FacilityDetailsSchema } from "@ukkidney/ukrdc-axios-ts";

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

    function fetchTable() {
      facilitiesApi
        .getFacilityList({
          includeInactive: props.includeInactive,
          includeEmpty: props.includeEmpty,
        })
        .then((response) => {
          facilities.value = response.data;
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

    const columns = [
      {
        key: "id",
        label: "ID",
      },
      {
        key: "description",
        label: "Name",
        sortable: true,
      },
      {
        key: "statistics.totalPatients",
        label: "Total records",
        sortable: true,
      },
      {
        key: "statistics.patientsReceivingMessageError",
        label: "Failing records",
        sortable: true,
      },
      {
        key: "dataFlow.pkbOut",
        label: "Sending to PKB",
        sortable: true,
      },
      {
        key: "lastMessageReceivedAt",
        label: "Last received",
        sortable: true,
      },
    ];

    return {
      facilities,
      columns,
      searchboxString,
      filterByPkbOut,
      filterByLastMessageOver48,
      filteredFacilities,
      facilityLastMessageOver48,
      formatDate,
    };
  },
});
</script>

<style scoped lang="postcss">
th {
  @apply px-4 py-3;
}
td {
  @apply whitespace-nowrap px-4 py-4;
}
</style>
