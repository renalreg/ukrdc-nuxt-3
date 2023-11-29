<template>
  <div>
    <NuxtLink :to="`/facilities/${facility.id}/errors`">
      <BaseAlertError
        v-if="(facility.statistics.patientsReceivingMessageError || 0) > 0"
        class="mb-4"
        :message="`${facility.statistics.patientsReceivingMessageError} patients are not receiving data due to errors in their incoming files. Click for details.`"
      >
      </BaseAlertError>
    </NuxtLink>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="col-span-1 flex flex-col gap-4 lg:col-span-2">
        <!-- Basic stats -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <IconUsers class="text-gray-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <h5>Total Records</h5>
                <div class="flex items-baseline">
                  <h1 class="flex-grow text-indigo-600">
                    {{ facility.statistics.totalPatients }}
                  </h1>
                  <NuxtLink
                    class="hover:underline"
                    :to="{
                      path: `/patientrecords/`,
                      query: { facility: facility.id },
                    }"
                  >
                    Show all records
                  </NuxtLink>
                </div>
              </div>
            </div>
            <template #footer>
              <p class="text-sm text-gray-600">Total records ever stored in the UKRDC for this facility</p>
            </template>
          </UCard>

          <UCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <IconExclamationTriangle class="text-gray-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <h5>Active Failing Records</h5>
                <div class="flex items-baseline">
                  <h1
                    class="flex-grow"
                    :class="
                      (facility.statistics.patientsReceivingMessageError || 0) > 0 ? 'text-red-600' : 'text-green-700'
                    "
                  >
                    {{ facility.statistics.patientsReceivingMessageError }}
                  </h1>
                  <NuxtLink class="hover:underline" :to="`/facilities/${facility.id}/errors`"> Show errors </NuxtLink>
                </div>
              </div>
            </div>
            <template #footer>
              <p class="text-sm text-gray-600">Active records currently failing due to errors</p>
            </template>
          </UCard>
        </div>

        <!-- Error history -->
        <UCard>
          <template #header>
            <h2>Error History</h2>
          </template>
          <FacilityErrorsHistoryPlot :facility="facility" />
        </UCard>

        <!-- Record types -->
        <UCard :ui="{ body: { padding: '' } }">
          <UTable :rows="feedTableItems" :columns="feedTableColumns">
            <template #historic-data="{ row }">
              <div v-if="row.historic" class="flex items-center">
                <IconCircle v-if="row.historic" class="inline text-orange-400" />
                <p>Historic</p>
              </div>
              <div v-else class="flex items-center">
                <IconCircle class="inline" :class="row.totalPatients > 0 ? 'text-green-600' : 'text-red-700'" />
                <p>{{ row.totalPatients > 0 ? "Enabled" : "Unused" }}</p>
              </div>
            </template>
          </UTable>
        </UCard>
      </div>

      <!-- Alerts -->
      <div class="col-span-1 flex flex-col gap-4">
        <UCard>
          <template #header>
            <h2>Alerts</h2>
          </template>

          <ul role="list" class="-my-5 divide-y divide-gray-300">
            <li v-if="hasPermission('ukrdc:messages:read')" class="py-5">
              <div v-if="!facility.lastMessageReceivedAt" class="flex items-center">
                <IconCircle class="inline text-red-600" />
                <h3>Data flow inactive</h3>
              </div>
              <div v-else-if="facilityLastMessageOver48(facility)" class="flex items-center">
                <IconCircle class="inline text-orange-400" />
                <h3>Data flow warning</h3>
              </div>
              <div v-else class="flex items-center">
                <IconCircle class="inline text-green-600" />
                <h3>Data flow active</h3>
              </div>
              <p class="mt-1">
                {{ latestDataInfo }}
              </p>
            </li>
            <li v-if="extracts && extracts.ukrdc <= 0" class="py-5">
              <div class="flex items-center">
                <IconCircle class="inline text-red-600" />
                <h3>Statistics unavailable</h3>
              </div>
              <p class="mt-1">Statistics are based on UKRDC data, and PatientView records are not included.</p>
              <p class="mt-1">You currently have no UKRDC records, and so statistics are currently unavailable.</p>
              <p class="mt-1">
                For more information, please refer to our
                <a href="https://renalregistry.atlassian.net/wiki/spaces/UD/overview" target="_blank">
                  UKRDC feed documentation.
                </a>
              </p>
            </li>
            <li v-if="extracts && extracts.ukrdc > 0" class="py-5">
              <div class="flex items-center">
                <IconCircle class="inline text-indigo-600" />
                <h3>UKRDC statistics</h3>
              </div>
              <p class="mt-1">Statistics are based on UKRDC data, and PatientView records are not included.</p>
              <p class="mt-1">You currently have {{ extracts.ukrdc }} UKRDC records.</p>
            </li>
          </ul>
        </UCard>

        <UCard v-if="facility && facility.dataFlow">
          <template #header>
            <h2>Data Flow</h2>
          </template>

          <ul role="list" class="-my-5 divide-y divide-gray-300">
            <li class="py-5">
              <div class="flex items-center">
                <IconCircle v-if="facility.dataFlow.pkbOut" class="inline text-green-600" />
                <IconCircle v-else class="inline text-red-600" />
                <h3>PKB Outbound</h3>
              </div>
              <p class="mt-1">
                Data sending to
                <a class="hover:underline" href="https://patientsknowbest.com/" target="blank"> Patients Know Best </a>
                is {{ facility.dataFlow.pkbOut ? "enabled" : "disabled" }}.
              </p>
              <p v-if="facility.dataFlow.pkbOut">
                Data will only be sent to PKB for patients with a PKB membership record.
              </p>
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type FacilityDetailsSchema, type FacilityExtractsSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseAlertError from "~/components/base/alert/BaseAlertError.vue";
import FacilityErrorsHistoryPlot from "~/components/FacilityErrorsHistoryPlot.vue";
import IconExclamationTriangle from "~/components/icons/hero/24/outline/IconExclamationTriangle.vue";
import IconUsers from "~/components/icons/hero/24/outline/IconUsers.vue";
import IconCircle from "~/components/icons/IconCircle.vue";
import usePermissions from "~/composables/usePermissions";
import { formatDate } from "~/helpers/dateUtils";
import { facilityLastMessageOver48 } from "~/helpers/facilityUtils";
import { allStatuses } from "~/helpers/messageUtils";

export default defineComponent({
  components: {
    IconCircle,
    BaseAlertError,
    IconExclamationTriangle,
    IconUsers,
    FacilityErrorsHistoryPlot,
  },
  props: {
    facility: {
      type: Object as () => FacilityDetailsSchema,
      required: true,
    },
    extracts: {
      type: Object as () => FacilityExtractsSchema,
      required: true,
    },
  },

  setup(props) {
    const { hasPermission } = usePermissions();

    // Computed string for the latest data received
    const latestDataInfo = computed(() => {
      if (!props.facility.lastMessageReceivedAt) {
        return "No data files received from this facility in over a year";
      } else {
        return `Latest data file recieved on ${formatDate(props.facility.lastMessageReceivedAt, true)}`;
      }
    });

    interface FeedTableItem {
      name: string;
      key: keyof FacilityExtractsSchema;
      historic: boolean;
      totalPatients: number;
    }

    const feedTableItems: FeedTableItem[] = [
      {
        name: "UKRDC Feeds",
        key: "ukrdc",
        historic: false,
        totalPatients: props.extracts.ukrdc,
      },
      {
        name: "PatientView Feeds",
        key: "pv",
        historic: false,
        totalPatients: props.extracts.pv,
      },
      {
        name: "RADAR Feeds",
        key: "radar",
        historic: false,
        totalPatients: props.extracts.radar,
      },
      {
        name: "PatientView Migrated Records",
        key: "pvmig",
        historic: true,
        totalPatients: props.extracts.pvmig,
      },
      {
        name: "HealthShare Migrated Records",
        key: "hsmig",
        historic: true,
        totalPatients: props.extracts.hsmig,
      },
      {
        name: "Survey Feeds",
        key: "survey",
        historic: false,
        totalPatients: props.extracts.survey,
      },
      {
        name: "UKRR Extract Records",
        key: "ukrr",
        historic: false,
        totalPatients: props.extracts.ukrr,
      },
    ];

    const feedTableColumns = [
      {
        key: "name",
        label: "Name",
      },
      {
        key: "historic",
        label: "historic",
      },
      {
        key: "totalPatients",
        label: "Total records",
      },
    ];

    return {
      hasPermission,
      facilityLastMessageOver48,
      allStatuses,
      latestDataInfo,
      feedTableItems,
      feedTableColumns,
    };
  },
});
</script>

<style scoped lang="postcss">
th {
  @apply px-6 py-3;
}
td {
  @apply whitespace-nowrap px-6 py-4;
}
</style>
