<template>
  <div>
    <UButton
      label="Quarterly Extracts"
      icon="i-heroicons-arrow-down-tray"
      color="gray"
      variant="outline"
      class="mt-4 sm:mt-0"
      @click="isExtractModalOpen = true"
    />

    <UModal v-model:open="isExtractModalOpen" title="Quarterly Extract Download Request">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Quarterly Extract Download Request</h3>
          </template>

          <UForm :state="extractForm" class="space-y-4" @submit="createExtract">
            <UFormField name="quarter" required>
              <template #label>
                <span class="flex items-center gap-1">
                  Quarter
                  <UTooltip :text="`${minQuarter} - ${maxQuarter}`">
                    <UIcon name="i-heroicons-information-circle" class="h-4 w-4 text-gray-400" />
                  </UTooltip>
                </span>
              </template>
              <UInput
                v-model.number="extractForm.quarter"
                type="number"
                :min="minQuarter"
                :max="maxQuarter"
                placeholder="Quarter number"
              />
            </UFormField>

            <UFormField name="sendingFacility">
              <template #label>
                <span class="flex items-center gap-1">
                  Sending Facility
                  <UIcon
                    :name="sendingFacilityOptions.length === 0 ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                    class="h-4 w-4"
                    :class="sendingFacilityOptions.length === 0 ? 'text-red-500' : 'text-green-500'"
                  />
                  <UTooltip
                    v-if="sendingFacilityOptions.length === 0"
                    text="This can be changed only when the facility is that of a feedshare"
                  >
                    <UIcon name="i-heroicons-information-circle" class="h-4 w-4 cursor-help text-gray-400" />
                  </UTooltip>
                </span>
              </template>

              <USelect
                v-if="sendingFacilityOptions.length > 0"
                v-model="extractForm.sendingFacility"
                :items="sendingFacilityDropdownOptions"
                :loading="isLoadingFacilityOptions"
              />
              <UInput v-else v-model="extractForm.sendingFacility" disabled :loading="isLoadingFacilityOptions" />
            </UFormField>

            <UFormField v-if="isCentreEditable" label="Centre" name="centre" required>
              <USelect v-model="extractForm.sendingFacility" :items="centreOptions" />
            </UFormField>

            <UAlert
              v-if="extractError"
              color="warning"
              variant="soft"
              title="Unable to create extract"
              :description="extractError"
            />

            <div class="flex justify-end gap-2 pt-2">
              <UButton label="Cancel" color="error" variant="ghost" @click="isExtractModalOpen = false" />
              <UButton
                type="submit"
                label="Create Extract"
                :loading="isCreatingExtract"
                :disabled="!isQuarterValid"
                color="success"
              />
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts">
import type { PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";
import type { AxiosError } from "axios";
import type { PropType } from "vue";

import useApi from "~/composables/useApi";

export default defineComponent({
  props: {
    pid: {
      type: String,
      required: true,
    },
    record: {
      type: Object as PropType<PatientRecordSchema | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const { patientRecordsApi, facilitiesApi } = useApi();

    // Quarterly extracts

    // Quarter numbers follow a sequential index starting at 1 for 1995-Q1,
    // incrementing by 1 for every quarter that has passed since then.
    // Mirrors the backend's year_to_first_quarter / date_to_quarter logic:
    //   year_to_first_quarter(year) = (year - 1995) * 4 + 1
    //   date_to_quarter(dt) = year_to_first_quarter(dt.year) + floor((dt.month - 1) / 3)
    function yearToFirstQuarter(year: number) {
      return (year - 1995) * 4 + 1;
    }

    function yearToQuarterNumber(date: Date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JS months are 0-indexed; convert to 1-12
      return yearToFirstQuarter(year) + Math.floor((month - 1) / 3);
    }

    const minQuarter = 1;
    const maxQuarter = computed(() => yearToQuarterNumber(new Date()));

    // Facility "feedshare" groupings
    //
    // facilitiesApi.getFacilityFeedshare({ code }) requires a code parameter,
    // but ignores it for filtering: it always returns the *entire* dictionary
    // of feedshare groupings, keyed by parent facility code (confirmed by
    // inspecting the actual response - passing different codes returns the
    // identical map). So rather than calling this twice with different codes,
    // we fetch it once and derive both the Centre and Sending Facility option
    // lists by looking up the relevant code in the same map. It's cached
    // server-side for an hour, so re-fetching per record is cheap regardless.
    const feedshareMap = ref<Record<string, string[]>>({});
    const isLoadingFeedshareMap = ref(false);

    async function fetchFeedshareMap(code: string) {
      if (!code) {
        feedshareMap.value = {};
        return;
      }

      isLoadingFeedshareMap.value = true;

      try {
        const response = await facilitiesApi.getFacilityFeedshare(
          {
            code,
          },
          { skipErrorToast: true },
        );
        feedshareMap.value = response.data ?? {};
      } catch {
        feedshareMap.value = {};
      } finally {
        isLoadingFeedshareMap.value = false;
      }
    }

    // Centre field is editable only when the record's sendingextract is a
    // key in the feedshare map (i.e. it has group members to offer).
    const centreOptions = computed(() => {
      const sendingExtract = props.record?.sendingextract;
      return sendingExtract ? (feedshareMap.value[sendingExtract] ?? []) : [];
    });

    const isCentreEditable = computed(() => centreOptions.value.length > 0);

    const isExtractModalOpen = ref(false);
    const isCreatingExtract = ref(false);
    const extractError = ref<string>();

    watch(isExtractModalOpen, (open) => {
      if (open) {
        extractError.value = undefined;
      }
    });

    const extractForm = reactive({
      quarter: maxQuarter.value as number | undefined,
      sendingFacility: props.record?.sendingfacility ?? "",
    });

    // Sending facility "feedshare" options
    //
    // A sending facility may be part of a "feedshare" group: a set of
    // facilities that share the same underlying data feed. If its code is a
    // key in the feedshare map, the field becomes a select limited to those
    // group members; otherwise the facility isn't part of a feedshare and
    // the field stays locked to its current value.
    const sendingFacilityOptions = computed(() => {
      const sendingFacility = props.record?.sendingfacility;
      return sendingFacility ? (feedshareMap.value[sendingFacility] ?? []) : [];
    });

    const isLoadingFacilityOptions = isLoadingFeedshareMap;

    // The feedshare API returns the *other* facilities in the group; the
    // record's own current facility isn't guaranteed to be included, but it
    // should always be selectable, so merge it in here for display.
    const sendingFacilityDropdownOptions = computed(() => {
      const original = props.record?.sendingfacility;
      if (!original) return sendingFacilityOptions.value;
      return sendingFacilityOptions.value.includes(original)
        ? sendingFacilityOptions.value
        : [original, ...sendingFacilityOptions.value];
    });

    watch(
      () => props.record,
      (value) => {
        extractForm.sendingFacility = value?.sendingfacility ?? "";
        // Either code works as the fetch param since the endpoint ignores
        // it, but prefer sendingfacility, falling back to sendingextract.
        fetchFeedshareMap(value?.sendingfacility ?? value?.sendingextract ?? "");
      },
    );

    const isQuarterValid = computed(() => {
      return (
        extractForm.quarter !== undefined &&
        extractForm.quarter >= minQuarter &&
        extractForm.quarter <= maxQuarter.value
      );
    });

    // Status codes the backend deliberately raises with a user-facing
    // `detail` message (see quarterly_extracts.py: MissingRecordError,
    // ConflictingDeathTimeError, QuarterlyExtractError, and the "unexpected
    // number of results" 500). Anything else falls back to the shared axios
    // response interceptor's generic handling.
    const ACCOUNTED_FOR_STATUSES = new Set([404, 409, 422, 500]);

    // The request uses responseType: "blob", so on error the response body
    // (including our JSON { detail } payload) arrives as a Blob rather than
    // parsed JSON. This reads it back out so we can show the real message.
    async function extractErrorDetail(error: AxiosError): Promise<string | undefined> {
      const data = error?.response?.data;
      if (!data) return undefined;

      try {
        const text = data instanceof Blob ? await data.text() : data;
        const parsed = typeof text === "string" ? JSON.parse(text) : text;
        return (parsed as { detail?: string })?.detail;
      } catch {
        return undefined;
      }
    }

    function createExtract() {
      if (!isQuarterValid.value) {
        return;
      }

      extractError.value = undefined;
      isCreatingExtract.value = true;

      patientRecordsApi
        .getPidQuarterlyExtract(
          {
            pid: props.pid,
            quarter: extractForm.quarter,
            centre: extractForm.sendingFacility,
          },
          { responseType: "blob", skipErrorToast: true },
        )
        .then((response) => {
          // Prefer the server-provided filename if it sends one via
          // Content-Disposition; otherwise fall back to a constructed name.
          const contentDisposition = response.headers?.["content-disposition"] as string | undefined;
          const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/);
          const filename =
            filenameMatch?.[1] ?? `${props.pid}_${extractForm.sendingFacility}_Q${extractForm.quarter}.rr`;

          const downloadUrl = window.URL.createObjectURL(response.data as Blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(downloadUrl);

          isExtractModalOpen.value = false;
        })
        .catch(async (error) => {
          const status = error?.response?.status;

          if (status && ACCOUNTED_FOR_STATUSES.has(status)) {
            const detail = await extractErrorDetail(error);
            // Shown inline at the bottom of the form rather than as a global
            // toast, since this error is specific to the form's current state.
            extractError.value = detail ?? "An error occurred while creating the extract.";
            return;
          }

          // Any other/unanticipated error is already surfaced via the shared
          // axios response interceptor (see useApi.ts), so no need to
          // duplicate that here.
        })
        .finally(() => {
          isCreatingExtract.value = false;
        });
    }

    return {
      isExtractModalOpen,
      isCreatingExtract,
      extractError,
      extractForm,
      minQuarter,
      maxQuarter,
      centreOptions,
      isCentreEditable,
      sendingFacilityOptions,
      sendingFacilityDropdownOptions,
      isLoadingFacilityOptions,
      isQuarterValid,
      createExtract,
    };
  },
});
</script>
