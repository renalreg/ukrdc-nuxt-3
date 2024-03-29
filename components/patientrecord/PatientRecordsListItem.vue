<template>
  <div>
    <div class="flex flex-col divide-y divide-gray-200">
      <!-- Main record info and menu button -->
      <div class="flex divide-x divide-gray-200">
        <!-- Main record info -->
        <NuxtLink :to="`/patientrecords/${item.pid}`" class="flex-grow">
          <div class="flex min-w-0 items-center gap-2 text-gray-800 hover:bg-gray-50">
            <div class="grid w-full min-w-0 flex-1 grid-cols-3 items-center gap-2 py-4 pl-4 sm:pl-6 lg:grid-cols-4">
              <!-- Sender -->
              <div v-if="showSender" :class="[showSenderFirst ? 'order-1' : 'order-2']">
                <div class="flex items-center gap-2">
                  <SendingFacilityLink
                    v-if="isRealSendingFacility(item)"
                    class="font-medium"
                    :code="item.sendingfacility"
                  />
                  <p v-else class="font-medium">
                    {{ titleText }}
                    <span v-if="isRADAR(item)">
                      / <SendingFacilityLink class="inline font-medium" :code="item.sendingfacility" />
                    </span>
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <MembershipStatusBadge v-if="isMembership(item)" :item="item" />
                  <p v-else>{{ viaText }}</p>
                </div>
              </div>

              <!-- Name, DoB, gender -->
              <div :class="[!showSenderFirst ? 'order-1' : 'order-2']">
                <h5 class="truncate">
                  <span class="sensitive truncate font-medium capitalize">
                    {{ item.patient?.names[0].given.toLowerCase() }}
                  </span>
                  <span class="sensitive truncate font-medium capitalize italic">
                    {{ item.patient?.names[0].family.toLowerCase() }}
                  </span>
                  <span class="sensitive ml-1 font-medium">
                    {{ item.patient?.gender ? formatGenderCharacter(item.patient?.gender) : "?" }}
                  </span>
                </h5>
                <p class="sensitive mt-2 flex items-center" :class="[{ 'text-red-700': item.patient?.deathTime }]">
                  {{ item.patient?.birthTime ? formatDate(item.patient?.birthTime, false) : "Unknown date of birth" }}
                  {{ item.patient?.deathTime ? ` – ${formatDate(item.patient?.deathTime, false)}` : "" }}
                </p>
              </div>

              <!-- Primary Identifier (medium breakpoint only) -->
              <div v-if="primaryIdentifier" class="order-3 hidden sm:block">
                <h5 class="truncate">{{ primaryIdentifier.label }} Number</h5>
                <p class="sensitive mt-2 truncate">
                  {{ primaryIdentifier.number ?? "" }}
                </p>
              </div>

              <!-- Created Time (large breakpoint, memberships only) -->
              <div v-if="isMembership(item)" class="order-4 hidden lg:block">
                <h5>Membership Created</h5>
                <p class="sensitive mt-2">
                  {{ formatDate(item.repositoryCreationDate, true) }}
                </p>
              </div>

              <!-- Last Updated (large breakpoint, non-memberships only) -->
              <div v-else class="order-4 hidden lg:block">
                <h5>Record Updated</h5>
                <p class="sensitive mt-2">
                  {{ formatDate(item.repositoryUpdateDate, true) }}
                </p>
              </div>

              <!-- PID (only if sender column is hidden) -->
              <div v-if="!showSender" class="order-5">
                <h5>PID</h5>
                <p class="sensitive mt-2">
                  {{ item.pid }}
                </p>
              </div>
            </div>
          </div>
        </NuxtLink>

        <PatientRecordManageMenu
          v-if="showManageMenu"
          class="flex flex-grow-0 items-center"
          :show-radar-sync="showRadarSync"
          :show-pkb-sync="showPkbSync"
          :item="item"
          @deleted="$emit('deleted')"
        />
      </div>

      <!-- Peek button -->
      <div
        v-if="showPeek"
        class="group flex h-8 w-full cursor-pointer justify-center gap-2 hover:bg-gray-50"
        @click="showDetail = !showDetail"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-chevron-down-20-solid"
            class="inline h-5 w-5 transform text-gray-500 transition group-hover:text-gray-800"
            :class="[showDetail ? 'rotate-180' : '']"
          />
          <p class="text-sm text-gray-500 group-hover:text-gray-800">
            {{ showDetail ? "HIDE RECORD" : "PEEK RECORD" }}
          </p>
        </div>
      </div>
    </div>

    <!-- Collapsible details -->
    <div v-show="showDetail && showPeek" class="bg-gray-50 px-4 py-4 shadow-inner sm:px-6">
      <PatientRecordPeek :record="item" />
    </div>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

import MembershipStatusBadge from "~/components/MembershipStatusBadge.vue";
import PatientRecordManageMenu from "~/components/patientrecord/PatientRecordManageMenu.vue";
import PatientRecordPeek from "~/components/patientrecord/PatientRecordPeek.vue";
import SendingFacilityLink from "~/components/SendingFacilityLink.vue";
import { formatGenderCharacter } from "~/helpers/codeUtils";
import { formatDate } from "~/helpers/dateUtils";
import { firstMRN, firstNI, isData, isMembership, isRADAR, isRealSendingFacility, isUKRR } from "~/helpers/recordUtils";

interface localNumber {
  label: string;
  number: string;
}

export default defineComponent({
  components: {
    MembershipStatusBadge,
    SendingFacilityLink,
    PatientRecordManageMenu,
    PatientRecordPeek,
  },
  props: {
    item: {
      type: Object as () => PatientRecordSummarySchema,
      required: true,
    },
    showSender: {
      type: Boolean,
      required: false,
      default: true,
    },
    showSenderFirst: {
      type: Boolean,
      required: false,
      default: true,
    },
    showPeek: {
      type: Boolean,
      required: false,
      default: true,
    },
    showManageMenu: {
      type: Boolean,
      required: false,
      default: true,
    },
    preferNiOverMrn: {
      type: Boolean,
      required: false,
      default: false,
    },
    showRadarSync: {
      type: Boolean,
      required: false,
      default: false,
    },
    showPkbSync: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ["deleted"],
  setup(props) {
    const showDetail = ref(false);

    const firstMRNObject = computed<localNumber | null>(() => {
      return firstMRN(props.item);
    });

    const firstNIObject = computed<localNumber | null>(() => {
      return firstNI(props.item);
    });

    const primaryIdentifier = computed<localNumber | null>(() => {
      if (props.preferNiOverMrn) {
        return firstNIObject.value ?? firstMRNObject.value;
      } else {
        return firstMRNObject.value ?? firstNIObject.value;
      }
    });

    const viaText = computed<string>(() => {
      // Data feeds (expand sendingextract into something more readable)
      if (isData(props.item)) {
        return `${props.item.sendingextract === "UKRDC" ? "RDA" : props.item.sendingextract} feed`;
      }
      // UKRR database
      if (isUKRR(props.item)) {
        return "UKRR import";
      }
      // Others
      switch (props.item.sendingextract) {
        case "PVMIG":
          return "PV migrated";
        case "HSMIG":
          return "HealthShare migrated";
      }
      switch (props.item.sendingfacility) {
        case "TRACING":
          return "NHS Spine import";
        case "NHSBT":
          return "NHSBT import";
      }
      return `${props.item.sendingextract}`;
    });

    const titleText = computed<string>(() => {
      // For RADAR records, the sending facility is an actual renal unit, rather than
      // the membership name, so we change the title to RADAR here for consistency with
      // other membership records. The template handles including the actual sending
      // facility in the `via` section.
      if (isRADAR(props.item)) {
        return "RADAR";
      }
      if (isMembership(props.item)) {
        switch (props.item.sendingfacility) {
          case "PV":
            return "PatientView";
        }
      }
      return `${props.item.sendingfacility}`;
    });

    return {
      showDetail,
      formatDate,
      formatGenderCharacter,
      primaryIdentifier,
      titleText,
      viaText,
      isRealSendingFacility,
      isRADAR,
      isMembership,
    };
  },
});
</script>
