import * as Sentry from "@sentry/vue";

interface SentryRuntimeConfig {
  dsn: string;
  environment: string;
}

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

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
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      }),
      new Sentry.Feedback({
        colorScheme: "light",
        useSentryUser: {
          email: "email",
          name: "fullName",
        },
        buttonLabel: "Feedback",
        submitButtonLabel: "Send Feedback",
        formTitle: "Send Feedback",
      }),
    ],
    tracesSampleRate: 1.0, // Lower if traffic substantially increases
  });

  nuxtApp.vueApp.mixin(
    Sentry.createTracingMixins({ trackComponents: true, timeout: 2000, hooks: ["activate", "mount", "update"] }),
  );
  Sentry.attachErrorHandler(nuxtApp.vueApp, {
    logErrors: false,
    attachProps: true,
    trackComponents: true,
    timeout: 2000,
    hooks: ["activate", "mount", "update"],
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
