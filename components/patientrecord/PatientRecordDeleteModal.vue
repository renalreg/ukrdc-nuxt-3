<template>
  <UModal v-model="visible" :transition="false">
    <div class="p-4">
      <div class="sm:flex sm:items-start">
        <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
          <UIcon name="i-heroicons-exclamation-circle" class="h-6 w-6 text-red-600" />
        </div>
        <div class="ml-8 mt-3 text-left sm:ml-4 sm:mt-0">
          <h3 id="modal-headline" class="text-lg font-medium leading-6 text-gray-900">
            {{ previewErrorMessage ? "Unable to delete patient record" : "Delete patient record" }}
          </h3>
          <div class="mt-2">
            <div v-if="previewErrorMessage">
              <p>{{ previewErrorMessage }}</p>
            </div>
            <div v-if="previewResponse && !deleteInProgress">
              <p class="mb-2">All data associated with this patient record will be deleted, including:</p>
              <div class="mt-4 grid grid-cols-2 gap-2">
                <!-- Patient record -->
                <UAlert
                  color="red"
                  variant="subtle"
                  :title="`Patient record ${previewResponse.patientRecord.pid}`"
                  :description="`Created ${formatDate(previewResponse.patientRecord.repositoryCreationDate, false)}`"
                  class="col-span-2 text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.programMemberships.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.programMemberships.length"
                  description="Program memberships"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.resultItems.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.resultItems.length"
                  description="Result items"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.observations.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.observations.length"
                  description="Observations"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.medications.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.medications.length"
                  description="Medications"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.documents.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.documents.length"
                  description="Documents"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.diagnoses.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.diagnoses.length"
                  description="Diagnoses"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.renaldiagnoses.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.renaldiagnoses.length"
                  description="Renal diagnoses"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.procedures.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.procedures.length"
                  description="Procedures"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.encounters.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.encounters.length"
                  description="Clinical encounters"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.clinicalRelationships.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.clinicalRelationships.length"
                  description="Clinical relationships"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.surveys.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.surveys.length"
                  description="Surveys"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.socialHistories.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.socialHistories.length"
                  description="Social histories"
                  class="text-center"
                />

                <UAlert
                  v-if="previewResponse.patientRecord.familyHistories.length > 0"
                  color="red"
                  variant="subtle"
                  :title="previewResponse.patientRecord.familyHistories.length"
                  description="Family histories"
                  class="text-center"
                />
              </div>

              <UButton
                v-if="previewResponse && !previewErrorMessage"
                variant="link"
                size="sm"
                label="Download summary of data"
                class="float-right"
                @click="downloadSummary"
              />
            </div>
          </div>

          <div v-if="(previewResponse && !previewErrorMessage) || deleteInProgress" class="clear-right pt-4">
            <UCheckbox
              v-model="confirmChecked"
              :disabled="!previewResponse"
              label="Yes, delete this record and all associated data"
            />
          </div>
        </div>
      </div>
      <div v-if="(!previewErrorMessage && !previewResponse) || deleteInProgress" class="w-full">
        <BaseLoadingIndicator></BaseLoadingIndicator>
      </div>
      <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <UButton
          v-if="previewResponse && !previewErrorMessage"
          class="ml-2"
          color="red"
          :disabled="!confirmChecked || deleteInProgress"
          @click="doRealDelete()"
        >
          Delete
        </UButton>
        <UButton @click="cancel()"> Cancel </UButton>
      </div>
    </div>
  </UModal>
</template>

<script lang="ts">
import {
  type LinkRecordSchema,
  type MasterRecordSchema,
  type PatientRecordSchema,
  type PersonSchema,
  type PidXRefSchema,
  type WorkItemSchema,
} from "@ukkidney/ukrdc-axios-ts";

import BaseLoadingIndicator from "~/components/base/BaseLoadingIndicator.vue";
import useApi from "~/composables/useApi";
import useModal from "~/composables/useCustomModal";
import { formatDate } from "~/helpers/dateUtils";
import { saveAs } from "~/helpers/fileUtils";

interface DeletePIDFromEMPISchema {
  persons: PersonSchema[];
  masterRecords: MasterRecordSchema[];
  pidxrefs: PidXRefSchema[];
  workItems: WorkItemSchema[];
  linkRecords: LinkRecordSchema[];
}

interface DeletePIDResponseSchema {
  hash: string;
  committed: boolean;

  patientRecord: any;
  empi: DeletePIDFromEMPISchema;
}

export default defineComponent({
  components: {
    BaseLoadingIndicator,
  },
  props: {
    item: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },
  emits: ["cancel", "confirm", "deleted"],
  setup(props, { emit }) {
    const toast = useToast();
    const { visible, show, hide, toggle } = useModal();
    const { patientRecordsApi } = useApi();

    const confirmChecked = ref(false);
    const previewResponse = ref<DeletePIDResponseSchema>();
    const deleteResponse = ref<DeletePIDResponseSchema>();
    const previewErrorMessage = ref<string>();
    const deleteInProgress = ref(false);

    function cancel(): void {
      emit("cancel");
      hide();
    }

    watch(visible, () => {
      // If the modal becomes visible
      if (visible.value) {
        // Reset the modal each time it's is shown.
        confirmChecked.value = false;
        previewResponse.value = undefined;
        deleteResponse.value = undefined;

        patientRecordsApi
          .postPatientDelete({
            pid: props.item.pid,
            deletePidRequest: {
              hash: undefined,
            },
          })
          .then((response) => {
            previewResponse.value = response.data;
          })
          .catch((error) => {
            previewErrorMessage.value = error.response.data.detail;
          });
      }
    });

    function downloadSummary() {
      const blob = new Blob([JSON.stringify(previewResponse.value)]);
      saveAs(blob, `${props.item.pid}-deleteSummary.json`);
    }

    function doRealDelete() {
      // Emit confirm event (currently unused)
      emit("confirm");
      // If the checkbox is checked and we have a preview response
      if (confirmChecked.value && previewResponse.value) {
        // Start the delete spinner
        deleteInProgress.value = true;

        patientRecordsApi
          .postPatientDelete({
            pid: props.item.pid,
            deletePidRequest: {
              hash: previewResponse.value?.hash,
            },
          })
          .then(() => {
            // Hide the modal
            hide();
            // Emit an event notifying parents that a record has been deleted
            emit("deleted");
            // Show success toast
            toast.add({
              title: "Success",
              description: "Record deleted",
            });
          })
          .catch((error) => {
            previewErrorMessage.value = error.response.data.detail;
          })
          .finally(() => {
            // Stop the delete spinner
            deleteInProgress.value = false;
          });
      }
    }

    return {
      visible,
      confirmChecked,
      previewResponse,
      deleteResponse,
      previewErrorMessage,
      deleteInProgress,
      downloadSummary,
      doRealDelete,
      cancel,
      show,
      hide,
      toggle,
      formatDate,
    };
  },
});
</script>
