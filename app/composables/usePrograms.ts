import useQuery from "~/composables/query/useQuery";

export default function () {
  const { stringQuery } = useQuery();

  // Temporarily hardcoded until knowing if all program names are to be 
  // included which will require bigger changes - not sure if the retrieval
  // of this full list of names is available at the moment.
  const programs = ref(["RADAR", "PV", "YHS", "SIM"]);

  const selectedProgram = stringQuery("program", undefined, true);

  return {
    programs,
    selectedProgram,
  };
}