<template>
  <div>
    <UCard>
      <template #header>
        <div class="mb-1">
          <h2 v-if="patientDocument">
            {{ patientDocument.documentname ?? "Unnamed Document" }}
          </h2>
          <USkeleton v-else class="h-6 w-1/2" />
        </div>
        <div>
          <h5 v-if="patientDocument">
            {{ patientDocument.documenttime ? formatDate(patientDocument.documenttime) : "Unknown date" }}
          </h5>
          <USkeleton v-else class="h-6 w-1/3" />
        </div>
      </template>
      <BaseDescriptionListGrid>
        <BaseDescriptionListGridItem>
          <dt>Entered At</dt>
          <dd v-if="patientDocument">
            {{ patientDocument.enteredatdesc ?? patientDocument.enteredatcode ?? "Unknown Facility" }}
          </dd>
          <USkeleton v-else class="h-6 w-1/2" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Entered By</dt>
          <dd v-if="patientDocument">
            {{ patientDocument.enteredbydesc ?? patientDocument.enteredbycode ?? "Unknown Person" }}
          </dd>
          <USkeleton v-else class="h-6 w-1/2" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Clinician:</dt>
          <dd v-if="patientDocument">
            {{ patientDocument.cliniciandesc ?? patientDocument.cliniciancode ?? "Unknown Clinician" }}
          </dd>
          <USkeleton v-else class="h-6 w-1/2" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Document Date</dt>
          <dd v-if="patientDocument">
            {{ patientDocument.documenttime ? formatDate(patientDocument.documenttime) : "Unknown date" }}
          </dd>
          <USkeleton v-else class="h-6 w-1/3" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Creation Date</dt>
          <dd v-if="patientDocument">
            {{ patientDocument.creationDate ? formatDate(patientDocument.creationDate) : "Unknown date" }}
          </dd>
          <USkeleton v-else class="h-6 w-1/3" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Update Date</dt>
          <dd v-if="patientDocument">
            {{ patientDocument.updateDate ? formatDate(patientDocument.updateDate) : "Unknown date" }}
          </dd>
          <USkeleton v-else class="h-6 w-1/3" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem v-if="patientDocument && patientDocument.notetext" class="sm:col-span-3">
          <dt>Note</dt>
          <dd class="whitespace-pre-wrap font-mono">
            {{ patientDocument.notetext }}
          </dd>
        </BaseDescriptionListGridItem>
        <UCard v-if="patientDocument" class="mt-2 sm:col-span-2">
          <BaseAttachment :filename="filename ?? 'Unknown filename'">
            <UButton variant="link" @click="downloadPatientRecordDocument()"> Download </UButton>
          </BaseAttachment>
        </UCard>
      </BaseDescriptionListGrid>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type DocumentSchema, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseAttachment from "~/components/base/BaseAttachment.vue";
import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";
import { saveAs } from "~/helpers/fileUtils";
import { getFirstOrValue } from "~/helpers/queryUtils";

export default defineComponent({
  components: {
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
    BaseAttachment,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },

  setup(props) {
    const route = useRoute();
    const { patientRecordsApi } = useApi();

    // Data refs
    const patientDocument = ref<DocumentSchema>();

    // Computed properties
    const filename = computed(() => {
      if (!patientDocument.value) {
        return undefined;
      }
      return patientDocument.value.filename ?? `${patientDocument.value.documentname}.txt`;
    });

    // Data fetching
    onMounted(() => {
      patientRecordsApi
        .getPatientDocument({
          pid: props.record.pid,
          documentId: getFirstOrValue(route.params.docid),
        })
        .then((response) => {
          patientDocument.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    const documentDownloadInProgress = ref(false);

    function downloadPatientRecordDocument() {
      documentDownloadInProgress.value = true;
      patientRecordsApi
        .getPatientDocumentDownload(
          {
            pid: props.record.pid,
            documentId: getFirstOrValue(route.params.docid),
          },
          {
            method: "GET",
            responseType: "blob",
          },
        )
        .then((response) => {
          const blob = new Blob([response.data]);
          saveAs(blob, patientDocument.value?.filename ?? `${patientDocument.value?.documentname}.txt`);
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    return {
      patientDocument,
      filename,
      formatDate,
      downloadPatientRecordDocument,
      documentDownloadInProgress,
    };
  },
});
</script>
