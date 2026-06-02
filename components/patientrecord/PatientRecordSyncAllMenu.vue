<template>
  <div v-if="buttonAvailable">
    <BaseModalSuccess ref="startSyncSuccessModal" title="Started Syncing to PKB" confirm-label="Go back to records">
      <p class="mb-4"><b>This usually takes a few minutes</b></p>
      <p>We're syncing data to PKB in the background.</p>
      <p>Depending on the size of the records, this may take up to an hour.</p>
    </BaseModalSuccess>

    <BaseModalSuccess
      ref="startSyncFailureModal"
      title="Failure Syncing to PKB"
      confirm-label="Go back to records"
      :danger="true"
    >
      <p>
        Please use the
        <a
          class="font-medium text-indigo-600 hover:text-indigo-500"
          href="https://renalregistry.atlassian.net/servicedesk/customer/portals"
          target="blank"
          >UK Kidney Association Help Center</a
        >
        if this issue persists.
      </p>
      <p>Please copy the following debug information into your request:</p>
      <p class="mt-3 font-mono">exportAllToPKB.fail {{ failedPIDs }}</p>
    </BaseModalSuccess>

    <BaseModalSuccess
      ref="startSyncPartialSuccessModal"
      title="Partial PKB Sync completed"
      confirm-label="Go back to records"
    >
      <p class="mb-4"><b>Some feeds were synced to PKB.</b></p>
      <p>
        Synced: <span class="font-mono">{{ succeededExtracts.join(", ") }}</span>
      </p>
      <p class="mt-2">
        Not synced: <span class="font-mono">{{ failedExtracts.join(", ") }}</span>
      </p>
      <p class="mt-3">
        If you need any of these feeds synced to PKB, please contact the UK Kidney Association Help Center.
      </p>
    </BaseModalSuccess>

    <UTooltip
      :text="!hasPkbMembership ? 'Patient does not have a PKB membership record' : undefined"
      :prevent="hasPkbMembership"
    >
      <UButton
        label="Sync to PKB"
        size="sm"
        icon="i-heroicons-cloud-arrow-up-20-solid"
        :disabled="!hasPkbMembership || syncInProgress"
        @click="exportAllToPKB"
      />
    </UTooltip>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

import BaseModalSuccess from "~/components/base/BaseModalSuccess.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { type ModalInterface } from "~/interfaces/modal";

export default defineComponent({
  components: {
    BaseModalSuccess,
  },
  props: {
    records: {
      type: Array as () => PatientRecordSummarySchema[],
      required: true,
    },
    hasPkbMembership: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const { hasPermission } = usePermissions();
    const { patientRecordsApi } = useApi();

    // Modals
    const startSyncSuccessModal = ref<ModalInterface>();
    const startSyncPartialSuccessModal = ref<ModalInterface>();
    const startSyncFailureModal = ref<ModalInterface>();

    // Data refs
    const buttonAvailable = computed(() => {
      return hasPermission("ukrdc:records:export");
    });

    const syncInProgress = ref(false);
    const succeededPIDs = ref<string[]>([]);
    const failedPIDs = ref<string[]>([]);

    // Convert UKRDC -> "RDA" to match the display convention used elsewhere
    function extractDisplayName(extract: string): string {
      return extract === "UKRDC" ? "RDA" : extract;
    }

    const succeededExtracts = computed(() => [
      ...new Set(
        props.records
          .filter((r) => succeededPIDs.value.includes(r.pid))
          .map((r) => extractDisplayName(r.sendingextract)),
      ),
    ]);

    const failedExtracts = computed(() => [
      ...new Set(
        props.records.filter((r) => failedPIDs.value.includes(r.pid)).map((r) => extractDisplayName(r.sendingextract)),
      ),
    ]);

    // Sync functionality
    function exportAllToPKB() {
      // Do nothing if sync is already in progress or button is disabled
      if (!props.hasPkbMembership || syncInProgress.value) {
        return;
      }

      syncInProgress.value = true;
      succeededPIDs.value = [];
      failedPIDs.value = [];

      // Create a set of promises, one for each record we're syncing
      const promises = props.records.map((record) => {
        return patientRecordsApi
          .postPatientExportPkb({ pid: record.pid })
          .then(() => {
            succeededPIDs.value.push(record.pid);
          })
          .catch(() => {
            // Append failed PID
            failedPIDs.value.push(record.pid);
          });
      });

      // Execute all promises, and show success, partial success, or failure modal
      Promise.allSettled(promises)
        .then(() => {
          const total = props.records.length;
          const failed = failedPIDs.value.length;

          if (failed === 0) {
            startSyncSuccessModal.value?.show();
          } else if (failed < total) {
            startSyncPartialSuccessModal.value?.show();
          } else {
            startSyncFailureModal.value?.show();
          }
        })
        .finally(() => {
          // Uncomment the line below if you want to re-enable the Sync All button after the operation completes
          // syncInProgress.value = false;
        });
    }

    return {
      startSyncSuccessModal,
      startSyncPartialSuccessModal,
      startSyncFailureModal,
      buttonAvailable,
      syncInProgress,
      succeededExtracts,
      failedExtracts,
      failedPIDs,
      exportAllToPKB,
    };
  },
});
</script>
