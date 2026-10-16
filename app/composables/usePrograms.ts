import useQuery from "~/composables/query/useQuery";

export default function () {
  const { stringQuery } = useQuery();

  const programs = ref<string[]>(["PKB", "RADAR"]);

  const selectedProgram = stringQuery("program", undefined, true);

  return {
    programs,
    selectedProgram,
  };
}