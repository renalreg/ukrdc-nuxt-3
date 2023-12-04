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
      new Sentry.Replay(),
    ],
    // Configure this whole part as you need it!
    tracesSampleRate: 0.2, // Change in prod
    replaysSessionSampleRate: 1.0, // Change in prod
    replaysOnErrorSampleRate: 1.0, // Change in prod if necessary
  });
});
