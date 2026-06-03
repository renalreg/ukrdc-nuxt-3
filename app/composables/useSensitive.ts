function isTruthy(value: string) {
  const lowerStr = value.toLowerCase();
  return lowerStr === "true" || lowerStr === "1" || lowerStr === "yes";
}

export default function () {
  // Blanks out all characters in a string, if demo mode is enabled
  const runtimeConfig = useRuntimeConfig();

  function sensitive(value: string | undefined): string | undefined {
    if (value && isTruthy(runtimeConfig.public.demoMode)) {
      return value.replace(/./g, "*");
    }
    return value;
  }

  function sensitiveNumbers(value: string | undefined): string | undefined {
    if (value && isTruthy(runtimeConfig.public.demoMode)) {
      return value.replace(/\d/g, "0");
    }
    return value;
  }

  const sensitiveCssFilter = computed(() => {
    if (isTruthy(runtimeConfig.public.demoMode)) {
      return "blur(8px)";
    } else {
      return "none";
    }
  });

  return {
    sensitive,
    sensitiveNumbers,
    sensitiveCssFilter,
  };
}
