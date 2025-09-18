import * as Sentry from "@sentry/vue";

interface SentryRuntimeConfig {
  dsn: string;
  environment: string;
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const runtimeOptions = runtimeConfig.public.sentry as SentryRuntimeConfig;

  if (!runtimeOptions.dsn) {
    return;
  }

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: runtimeOptions.dsn,
    environment: runtimeOptions.environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: "light",
        useSentryUser: {
          email: "email",
          name: "fullName",
        },
        buttonLabel: "Feedback",
        submitButtonLabel: "Send Feedback",
        formTitle: "Send Feedback",
      }),
      // configure component tracing here (was previously done via attachErrorHandler/createTracingMixins)
      Sentry.vueIntegration({
        app: nuxtApp.vueApp,
        tracingOptions: {
          trackComponents: true,
          timeout: 2000,
          hooks: ["activate", "mount", "update"],
        },
      }),
    ],
    tracesSampleRate: 1.0, // Lower if traffic substantially increases
    ignoreErrors: [
      /**
       * Nuxt internal error seemingly thrown when the user navigates to a missing page.
       * Due to changes made to stats and login routes, these come up a lot, but can be ignored.
       */
      "TypeError: Failed to execute 'removeChild' on 'Node': parameter 1 is not of type 'Node'.",
    ],
  });

  return {
    provide: {
      sentrySetContext: Sentry.setContext,
      sentrySetUser: Sentry.setUser,
      sentrySetTag: Sentry.setTag,
      sentryAddBreadcrumb: Sentry.addBreadcrumb,
      sentryCaptureException: Sentry.captureException,
    },
  };
});
