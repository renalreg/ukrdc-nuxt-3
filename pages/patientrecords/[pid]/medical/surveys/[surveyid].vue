<template>
  <BaseLoadingContainer :loading="!survey">
    <div v-if="survey" class="sensitive">
      <UCard class="mb-4">
        <template #header>
          <h3 class="text-lg font-medium leading-6 text-gray-900">Survey Information</h3>
          <p class="mt-1 max-w-2xl text-gray-500">
            {{ survey.id }}
          </p>
        </template>

        <BaseDescriptionListGrid>
          <BaseDescriptionListGridItem>
            <dt>Entered On</dt>
            <dd>
              {{ formatDate(survey.surveytime, false) }}
            </dd>
          </BaseDescriptionListGridItem>
          <BaseDescriptionListGridItem>
            <dt>Facility Code</dt>
            <dd>
              {{ survey.enteredatcode }}
            </dd>
          </BaseDescriptionListGridItem>
          <BaseDescriptionListGridItem>
            <dt>Entered By</dt>
            <dd>
              {{ survey.enteredbycode }}
            </dd>
          </BaseDescriptionListGridItem>
          <BaseDescriptionListGridItem>
            <dt>Survey Type Code</dt>
            <dd>
              {{ survey.surveytypecode }}
            </dd>
          </BaseDescriptionListGridItem>
        </BaseDescriptionListGrid>
      </UCard>

      <div v-for="(questions, group) in groupedQuestions" :key="group">
        <UCard :ui="{ body: { padding: '' } }" class="mb-4">
          <template #header>
            <h3>
              {{ group || "Ungrouped" }}
            </h3>
          </template>
          <UTable :rows="questions" :columns="columns" />
        </UCard>
      </div>
    </div>
  </BaseLoadingContainer>
</template>

<script lang="ts">
import { type PatientRecordSchema, type SurveyQuestionSchema, type SurveySchema } from "@ukkidney/ukrdc-axios-ts";

import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import BaseLoadingContainer from "~/components/base/BaseLoadingContainer.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

interface GroupedQuestions {
  [key: string]: SurveyQuestionSchema[];
}

export default defineComponent({
  components: {
    BaseLoadingContainer,
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
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
    const survey = ref<SurveySchema>();

    // Data fetching
    // NOTE: I know it's not very efficient to fetch all surveys just to show one here,
    // but right now the API has no route to get a specific survey, and it's used so
    // infrequently anyway that it's not been worth doing something smarter yet.
    // There may be a way to pass a specific survey object to this page in Nuxt?
    onMounted(() => {
      patientRecordsApi
        .getPatientSurveys({
          pid: props.record.pid,
        })
        .then((response) => {
          const surveys: SurveySchema[] = response.data;

          // Find this specific survey
          const thisSurvey = surveys.find((element) => element.id === route.params.surveyid);

          // If no matching survey is found, throw a 404 error
          if (!thisSurvey) {
            throw createError({
              statusCode: 404,
              statusMessage: "Survey Not Found",
            });
          }

          // Assign data
          survey.value = thisSurvey;
        });
    });

    const groupedQuestions = computed(() => {
      if (!survey.value?.questions) {
        return {};
      }
      const groups = {} as GroupedQuestions;
      for (const question of survey.value.questions) {
        // Move ungrouped questions to the Ungrouped group
        if (!question.questionGroup) {
          question.questionGroup = "Ungrouped";
        }
        // If group doesn't appear yet in groups, add it
        if (question.questionGroup && !(question.questionGroup in groups)) {
          groups[question.questionGroup] = [];
        }
        // Add questions to the associated group
        groups[question.questionGroup || "Ungrouped"].push(question);
      }
      return groups;
    });

    const columns = [
      {
        key: "questiontypecode",
        label: "Question code",
        sortable: true,
      },
      {
        key: "questionType",
        label: "Question type",
      },
      {
        key: "response",
        label: "Response code",
      },
      {
        key: "responseText",
        label: "Response text",
      },
    ];

    return {
      survey,
      groupedQuestions,
      columns,
      formatDate,
    };
  },
});
</script>
