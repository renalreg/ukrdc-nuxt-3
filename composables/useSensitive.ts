export default function () {
  // Blanks out all characters in a string, if demo mode is enabled
  const runtimeConfig = useRuntimeConfig()

  function sensitive(value: string | undefined): string | undefined {
    if (value && runtimeConfig.public.demoMode !== '0') {
      return value.replace(/./g, "*");
    }
    return value;
  }

  function sensitiveNumbers(value: string | undefined): string | undefined {
    if (value && runtimeConfig.public.demoMode !== '0') {
      return value.replace(/\d/g, "0");
    }
    return value;
  }

  const sensitiveCssFilter = computed(() => {
    if (runtimeConfig.public.demoMode !== '0') {
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
