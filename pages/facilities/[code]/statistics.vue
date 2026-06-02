<template>
  <div>
    <UAlert
      class="mb-4"
      title="The data displayed on this page have yet to be fully verified and may be subject to change or correction."
      description="They should be used for the purposes of improving data quality and accuracy, and should not be used to form the
        basis of clinical decisions."
      icon="i-heroicons-information-circle-20-solid"
    />

    <div class="flex gap-8">
      <UVerticalNavigation :links="links" />
      <NuxtPage v-if="facility && extracts" class="flex-1" :facility="facility" :extracts="extracts" />
    </div>
  </div>
</template>

<script lang="ts">
import { type FacilityDetailsSchema, type FacilityExtractsSchema } from "@ukkidney/ukrdc-axios-ts";

export default defineComponent({
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

  setup() {
    const route = useRoute();
    const router = useRouter();

    // Navigation

    const links = [
      {
        label: "Demographics",
        to: `/facilities/${route.params.code}/statistics/demographics`,
      },
      {
        label: "KRT",
        to: `/facilities/${route.params.code}/statistics/krt`,
      },
    ];

    onMounted(() => {
      // Default to demographics stats
      if (route.path === `/facilities/${route.params.code}/statistics`) {
        router.push(`/facilities/${route.params.code}/statistics/demographics`);
      }
    });

    return {
      links,
    };
  },
});
</script>
